from django.contrib import admin
from .models import Wallet, Transfer, LedgerEntry


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("user", "available_balance", "ledger_balance", "currency", "updated_at")
    list_filter = ("currency", "updated_at")
    search_fields = ("user__email", "user__full_name")
    readonly_fields = ("id", "updated_at")


@admin.register(Transfer)
class TransferAdmin(admin.ModelAdmin):
    list_display = ("reference", "sender", "recipient", "amount", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("reference", "sender__email", "recipient__email")
    readonly_fields = ("id", "created_at")


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ("wallet", "entry_type", "category", "amount", "created_at")
    list_filter = ("entry_type", "category", "created_at")
    search_fields = ("wallet__user__email", "reference", "description")
    readonly_fields = ("id", "created_at")
