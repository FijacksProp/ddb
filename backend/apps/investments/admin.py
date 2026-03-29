from django.contrib import admin
from .models import InvestmentProduct, InvestmentHolding


@admin.register(InvestmentProduct)
class InvestmentProductAdmin(admin.ModelAdmin):
    list_display = ("name", "annual_yield", "minimum_amount", "tenure_days", "is_active")
    list_filter = ("is_active", "capital_protected")
    search_fields = ("name",)
    readonly_fields = ("id",)


@admin.register(InvestmentHolding)
class InvestmentHoldingAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "amount", "status", "maturity_date", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__email", "user__full_name")
    readonly_fields = ("id", "created_at")
