import uuid

from django.db import transaction

from apps.accounts.models import User
from apps.banking.models import LedgerEntry, Transfer, Wallet


class WalletService:
    @staticmethod
    @transaction.atomic
    def credit_wallet(user: User, amount, category: str, description: str, reference: str | None = None):
        wallet = Wallet.objects.select_for_update().get(user=user)
        wallet.available_balance += amount
        wallet.ledger_balance += amount
        wallet.save(update_fields=["available_balance", "ledger_balance", "updated_at"])
        LedgerEntry.objects.create(
            wallet=wallet,
            entry_type=LedgerEntry.EntryType.CREDIT,
            category=category,
            amount=amount,
            running_balance=wallet.available_balance,
            reference=reference or uuid.uuid4().hex[:16].upper(),
            description=description,
        )
        return wallet

    @staticmethod
    @transaction.atomic
    def debit_wallet(user: User, amount, category: str, description: str, reference: str | None = None):
        wallet = Wallet.objects.select_for_update().get(user=user)
        if wallet.available_balance < amount:
            raise ValueError("Insufficient wallet balance")
        wallet.available_balance -= amount
        wallet.ledger_balance -= amount
        wallet.save(update_fields=["available_balance", "ledger_balance", "updated_at"])
        LedgerEntry.objects.create(
            wallet=wallet,
            entry_type=LedgerEntry.EntryType.DEBIT,
            category=category,
            amount=amount,
            running_balance=wallet.available_balance,
            reference=reference or uuid.uuid4().hex[:16].upper(),
            description=description,
        )
        return wallet

    @staticmethod
    @transaction.atomic
    def transfer(sender: User, recipient: User, amount, narration: str = ""):
        if sender.id == recipient.id:
            raise ValueError("Self-transfers are not allowed")
        reference = f"DDB{uuid.uuid4().hex[:12].upper()}"
        WalletService.debit_wallet(
            sender,
            amount,
            category="wallet_transfer",
            description=f"Transfer to {recipient.full_name}",
            reference=reference,
        )
        recipient_wallet = Wallet.objects.select_for_update().get(user=recipient)
        recipient_wallet.available_balance += amount
        recipient_wallet.ledger_balance += amount
        recipient_wallet.save(update_fields=["available_balance", "ledger_balance", "updated_at"])
        LedgerEntry.objects.create(
            wallet=recipient_wallet,
            entry_type=LedgerEntry.EntryType.CREDIT,
            category="wallet_transfer",
            amount=amount,
            running_balance=recipient_wallet.available_balance,
            reference=reference,
            description=f"Transfer from {sender.full_name}",
            counterparty_name=sender.full_name,
        )
        return Transfer.objects.create(
            sender=sender,
            recipient=recipient,
            amount=amount,
            narration=narration,
            reference=reference,
        )
