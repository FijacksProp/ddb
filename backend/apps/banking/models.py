import uuid
from decimal import Decimal

from django.conf import settings
from django.db import models


class Wallet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    available_balance = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    ledger_balance = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="NGN")
    updated_at = models.DateTimeField(auto_now=True)


class Transfer(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="outgoing_transfers")
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="incoming_transfers")
    amount = models.DecimalField(max_digits=16, decimal_places=2)
    fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    narration = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=40, unique=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.COMPLETED)
    created_at = models.DateTimeField(auto_now_add=True)


class LedgerEntry(models.Model):
    class EntryType(models.TextChoices):
        DEBIT = "debit", "Debit"
        CREDIT = "credit", "Credit"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="entries")
    entry_type = models.CharField(max_length=8, choices=EntryType.choices)
    category = models.CharField(max_length=40)
    amount = models.DecimalField(max_digits=16, decimal_places=2)
    running_balance = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal("0.00"))
    reference = models.CharField(max_length=40)
    description = models.CharField(max_length=255)
    counterparty_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
