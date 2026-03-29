import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class InvestmentProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    minimum_amount = models.DecimalField(max_digits=16, decimal_places=2, default=500)
    annual_yield = models.DecimalField(max_digits=5, decimal_places=2)
    tenure_days = models.PositiveIntegerField(default=90)
    liquidity_days = models.PositiveIntegerField(default=1)
    capital_protected = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)


class InvestmentHolding(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        MATURED = "matured", "Matured"
        WITHDRAWN = "withdrawn", "Withdrawn"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="investment_holdings")
    product = models.ForeignKey(InvestmentProduct, on_delete=models.PROTECT, related_name="holdings")
    amount = models.DecimalField(max_digits=16, decimal_places=2)
    annual_yield = models.DecimalField(max_digits=5, decimal_places=2)
    yield_accrued = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    next_payout_at = models.DateTimeField(default=timezone.now)
    maturity_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        start = self.created_at if self.created_at else timezone.now()
        if not self.maturity_date or self.maturity_date <= start:
            self.maturity_date = start + timedelta(days=self.product.tenure_days)
            self.next_payout_at = start + timedelta(days=1)
        super().save(*args, **kwargs)
