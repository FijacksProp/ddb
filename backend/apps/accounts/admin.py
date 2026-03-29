from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "full_name", "phone_number", "account_number", "kyc_tier", "is_bvn_verified", "government_id_verified")
    list_filter = ("kyc_tier", "segment", "is_bvn_verified", "is_phone_verified", "government_id_verified", "proof_of_address_verified")
    search_fields = ("email", "full_name", "phone_number", "account_number")
    readonly_fields = ("id", "account_number", "date_joined", "last_login")
    fieldsets = (
        ("Account Info", {"fields": ("id", "email", "phone_number", "full_name", "date_joined", "last_login")}),
        ("Account Details", {"fields": ("account_number", "kyc_tier", "segment", "risk_band")}),
        ("Verification", {"fields": ("bvn", "nin", "is_bvn_verified", "is_phone_verified", "government_id_verified", "proof_of_address_verified", "biometric_verified")}),
        ("Digital Profile", {"fields": ("profile_photo_url", "next_of_kin_name", "linked_cards_count", "security_profile_score")}),
        ("Business Info", {"fields": ("business_name", "sector", "monthly_revenue")}),
    )
