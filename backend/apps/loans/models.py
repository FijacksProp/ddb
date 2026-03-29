import uuid

from django.conf import settings
from django.db import models


class LoanProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    sector_tag = models.CharField(max_length=120, blank=True)
    minimum_amount = models.DecimalField(max_digits=16, decimal_places=2)
    maximum_amount = models.DecimalField(max_digits=16, decimal_places=2)
    base_interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    max_tenure_months = models.PositiveIntegerField(default=12)
    minimum_score = models.PositiveIntegerField(default=55)
    is_active = models.BooleanField(default=True)


class LoanApplication(models.Model):
    class Decision(models.TextChoices):
        APPROVED = "approved", "Approved"
        REVIEW = "manual_review", "Manual Review"
        DECLINED = "declined", "Declined"

    class Status(models.TextChoices):
        APPLIED = "applied", "Applied"
        DISBURSED = "disbursed", "Disbursed"
        REJECTED = "rejected", "Rejected"
        REPAID = "repaid", "Repaid"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="loan_applications")
    product = models.ForeignKey(LoanProduct, on_delete=models.PROTECT, related_name="applications")
    amount_requested = models.DecimalField(max_digits=16, decimal_places=2)
    amount_approved = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    tenure_months = models.PositiveIntegerField(default=3)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    monthly_repayment = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    outstanding_balance = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    next_repayment_at = models.DateTimeField(null=True, blank=True)
    credit_score = models.PositiveIntegerField(default=0)
    decision = models.CharField(max_length=16, choices=Decision.choices, default=Decision.REVIEW)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.APPLIED)
    purpose = models.CharField(max_length=255, blank=True)
    score_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
