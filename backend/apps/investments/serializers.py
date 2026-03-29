from rest_framework import serializers

from apps.banking.services import WalletService
from apps.investments.models import InvestmentHolding, InvestmentProduct


class InvestmentProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentProduct
        fields = "__all__"


class InvestmentHoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentHolding
        fields = "__all__"
        read_only_fields = ["id", "user", "annual_yield", "yield_accrued", "status", "next_payout_at", "maturity_date", "created_at"]

    def create(self, validated_data):
        request = self.context["request"]
        product = validated_data["product"]
        WalletService.debit_wallet(
            user=request.user,
            amount=validated_data["amount"],
            category="investment_subscription",
            description=f"Investment subscription for {product.name}",
        )
        return InvestmentHolding.objects.create(
            user=request.user,
            annual_yield=product.annual_yield,
            **validated_data,
        )
