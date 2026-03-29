from rest_framework import serializers

from apps.accounts.models import User
from apps.banking.models import LedgerEntry, Transfer, Wallet
from apps.banking.services import WalletService


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["id", "currency", "available_balance", "ledger_balance", "updated_at"]


class LedgerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerEntry
        fields = "__all__"


class TransferSerializer(serializers.ModelSerializer):
    recipient_account_number = serializers.CharField(write_only=True)

    class Meta:
        model = Transfer
        fields = [
            "id",
            "sender",
            "recipient",
            "recipient_account_number",
            "amount",
            "fee",
            "narration",
            "reference",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "sender", "recipient", "fee", "reference", "status", "created_at"]

    def create(self, validated_data):
        account_number = validated_data.pop("recipient_account_number")
        try:
            recipient = User.objects.get(account_number=account_number)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({"recipient_account_number": "Recipient account not found"}) from exc
        return WalletService.transfer(
            self.context["request"].user,
            recipient,
            validated_data["amount"],
            validated_data.get("narration", ""),
        )
