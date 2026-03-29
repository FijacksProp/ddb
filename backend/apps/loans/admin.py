from django.contrib import admin
from .models import LoanProduct, LoanApplication


@admin.register(LoanProduct)
class LoanProductAdmin(admin.ModelAdmin):
    list_display = ("name", "base_interest_rate", "minimum_amount", "maximum_amount", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "sector_tag")
    readonly_fields = ("id",)


@admin.register(LoanApplication)
class LoanApplicationAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "amount_requested", "decision", "status", "created_at")
    list_filter = ("decision", "status", "created_at")
    search_fields = ("user__email", "user__full_name")
    readonly_fields = ("id", "created_at", "credit_score")

