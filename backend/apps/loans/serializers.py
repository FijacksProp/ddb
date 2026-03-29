from decimal import Decimal

from datetime import timedelta
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers

from apps.banking.models import Transfer
from apps.banking.services import WalletService
from apps.loans.models import LoanApplication, LoanProduct
from apps.loans.scoring import evaluate_loan_eligibility


class LoanProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanProduct
        fields = "__all__"


class LoanApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanApplication
        fields = "__all__"
        read_only_fields = [
            "id",
            "user",
            "amount_approved",
            "interest_rate",
            "monthly_repayment",
            "outstanding_balance",
            "next_repayment_at",
            "credit_score",
            "decision",
            "status",
            "score_payload",
            "created_at",
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user if request else None
        if user and LoanApplication.objects.filter(
            user=user,
            status__in=[LoanApplication.Status.APPLIED, LoanApplication.Status.DISBURSED],
        ).exists():
            raise serializers.ValidationError(
                {
                    "non_field_errors": [
                        "You already have an active loan. Clear or repay your current loan before requesting a new one."
                    ]
                }
            )

        product = attrs.get("product")
        amount_requested = Decimal(attrs.get("amount_requested") or 0)
        tenure_months = int(attrs.get("tenure_months") or 0)
        if amount_requested < product.minimum_amount:
            raise serializers.ValidationError(
                {"amount_requested": f"Minimum amount for this product is {product.minimum_amount}."}
            )
        if amount_requested > product.maximum_amount:
            raise serializers.ValidationError(
                {"amount_requested": f"Maximum amount for this product is {product.maximum_amount}."}
            )
        if tenure_months < 1 or tenure_months > product.max_tenure_months:
            raise serializers.ValidationError(
                {"tenure_months": f"Tenure must be between 1 and {product.max_tenure_months} months for this product."}
            )
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        wallet = user.wallet
        ninety_days_ago = timezone.now() - timedelta(days=90)
        recent_transfers = Transfer.objects.filter(
            created_at__gte=ninety_days_ago
        ).filter(
            Q(sender=user) | Q(recipient=user)
        )
        recent_entries = wallet.entries.filter(created_at__gte=ninety_days_ago)
        score_result = evaluate_loan_eligibility(
            user=user,
            wallet=wallet,
            transfers=recent_transfers,
            ledger_entries=recent_entries,
        )
        product = validated_data["product"]
        approved_amount = min(Decimal(validated_data["amount_requested"]), score_result["max_amount"], product.maximum_amount)
        decision = score_result["decision"]
        status = LoanApplication.Status.APPLIED
        if score_result["score"] < product.minimum_score:
            decision = LoanApplication.Decision.DECLINED
        if decision == LoanApplication.Decision.APPROVED and approved_amount > 0:
            status = LoanApplication.Status.DISBURSED
            WalletService.credit_wallet(
                user=user,
                amount=approved_amount,
                category="loan_disbursement",
                description=f"Loan disbursement for {product.name}",
            )
        else:
            approved_amount = Decimal("0.00")
            if decision == LoanApplication.Decision.APPROVED:
                decision = LoanApplication.Decision.REVIEW
            if decision == LoanApplication.Decision.DECLINED:
                status = LoanApplication.Status.REJECTED

        repayment_base = approved_amount * (Decimal("1.00") + (product.base_interest_rate / Decimal("100")))
        monthly_repayment = repayment_base / max(validated_data["tenure_months"], 1) if approved_amount else Decimal("0.00")
        next_repayment_at = timezone.now() + timedelta(days=30) if status == LoanApplication.Status.DISBURSED else None
        return LoanApplication.objects.create(
            user=user,
            amount_approved=approved_amount,
            interest_rate=product.base_interest_rate,
            monthly_repayment=monthly_repayment,
            outstanding_balance=repayment_base if approved_amount else Decimal("0.00"),
            next_repayment_at=next_repayment_at,
            credit_score=score_result["score"],
            decision=decision,
            status=status,
            score_payload={
                "category_scores": score_result["category_scores"],
                "breakdown": score_result["breakdown"],
                "max_amount": str(score_result["max_amount"]),
            },
            **validated_data,
        )
