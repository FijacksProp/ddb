import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Kind(models.TextChoices):
        SYSTEM = "system", "System"
        KYC = "kyc", "KYC"
        TRANSFER = "transfer", "Transfer"
        LOAN = "loan", "Loan"
        INVESTMENT = "investment", "Investment"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=120)
    message = models.TextField()
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.SYSTEM)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=120)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
