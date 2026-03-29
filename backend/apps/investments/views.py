from rest_framework import viewsets

from apps.investments.models import InvestmentHolding, InvestmentProduct
from apps.investments.serializers import InvestmentHoldingSerializer, InvestmentProductSerializer


class InvestmentProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvestmentProductSerializer

    def get_queryset(self):
        defaults = [
            {
                "name": "Treasury Income Vault",
                "description": "Treasury-style product with daily accrual and T+1 liquidity.",
                "minimum_amount": 500,
                "annual_yield": 12,
                "tenure_days": 90,
                "liquidity_days": 1,
                "capital_protected": True,
            },
            {
                "name": "Growth Reserve Note",
                "description": "Longer-duration product for higher annualized yield.",
                "minimum_amount": 500,
                "annual_yield": 15,
                "tenure_days": 180,
                "liquidity_days": 2,
                "capital_protected": True,
            },
        ]
        for item in defaults:
            InvestmentProduct.objects.get_or_create(name=item["name"], defaults=item)
        return InvestmentProduct.objects.filter(is_active=True)


class InvestmentHoldingViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentHoldingSerializer

    def get_queryset(self):
        return InvestmentHolding.objects.filter(user=self.request.user).select_related("product")
