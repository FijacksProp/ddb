import uuid

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    class KycTier(models.TextChoices):
        TIER_1 = "tier_1", "Tier 1"
        TIER_2 = "tier_2", "Tier 2"
        TIER_3 = "tier_3", "Tier 3"

    class Segment(models.TextChoices):
        RETAIL = "retail", "Retail"
        SME = "sme", "SME"
        AGRICULTURE = "agriculture", "Agriculture"
        CORPORATE = "corporate", "Corporate"

    class RiskBand(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, unique=True)
    account_number = models.CharField(max_length=10, unique=True, blank=True)
    bvn = models.CharField(max_length=11, blank=True)
    nin = models.CharField(max_length=11, blank=True)
    kyc_tier = models.CharField(max_length=16, choices=KycTier.choices, default=KycTier.TIER_1)
    segment = models.CharField(max_length=16, choices=Segment.choices, default=Segment.RETAIL)
    business_name = models.CharField(max_length=255, blank=True)
    sector = models.CharField(max_length=120, blank=True)
    monthly_revenue = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    risk_band = models.CharField(max_length=10, choices=RiskBand.choices, default=RiskBand.MEDIUM)
    is_phone_verified = models.BooleanField(default=False)
    is_bvn_verified = models.BooleanField(default=False)
    government_id_verified = models.BooleanField(default=False)
    proof_of_address_verified = models.BooleanField(default=False)
    biometric_verified = models.BooleanField(default=False)
    security_profile_score = models.PositiveSmallIntegerField(default=7)
    profile_photo_url = models.URLField(blank=True)
    next_of_kin_name = models.CharField(max_length=255, blank=True)
    linked_cards_count = models.PositiveSmallIntegerField(default=0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "phone_number"]

    objects = UserManager()

    def _derived_account_number(self) -> str:
        digits = "".join(ch for ch in (self.phone_number or "") if ch.isdigit())
        local_number = digits[-10:].zfill(10)
        return local_number

    def save(self, *args, **kwargs):
        if not self.account_number:
            candidate = self._derived_account_number()
            suffix = 0
            while User.objects.filter(account_number=candidate).exclude(pk=self.pk).exists():
                candidate = f"{self._derived_account_number()[:9]}{suffix % 10}"
                suffix += 1
            self.account_number = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.email})"
