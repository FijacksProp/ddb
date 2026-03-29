from rest_framework import serializers

from apps.accounts.models import User
from apps.banking.models import Wallet


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone_number",
            "account_number",
            "bvn",
            "nin",
            "kyc_tier",
            "segment",
            "business_name",
            "sector",
            "monthly_revenue",
            "risk_band",
            "is_phone_verified",
            "is_bvn_verified",
            "government_id_verified",
            "proof_of_address_verified",
            "biometric_verified",
            "security_profile_score",
            "profile_photo_url",
            "next_of_kin_name",
            "linked_cards_count",
        ]
        read_only_fields = ["id", "account_number", "risk_band"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "full_name",
            "phone_number",
            "bvn",
            "nin",
            "segment",
            "business_name",
            "sector",
            "monthly_revenue",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        Wallet.objects.create(user=user)
        return user
