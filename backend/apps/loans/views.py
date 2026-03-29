from rest_framework import viewsets

from apps.loans.models import LoanApplication, LoanProduct
from apps.loans.serializers import LoanApplicationSerializer, LoanProductSerializer


class LoanProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LoanProductSerializer

    def get_queryset(self):
        defaults = [
            {
                "name": "SME Working Capital",
                "description": "Inventory, payroll support, and operational liquidity for SMEs.",
                "sector_tag": "sme",
                "minimum_amount": 10000,
                "maximum_amount": 750000,
                "base_interest_rate": 14.5,
                "max_tenure_months": 6,
                "minimum_score": 55,
            },
            {
                "name": "Education Support",
                "description": "Structured short-term finance for tuition and professional development.",
                "sector_tag": "retail",
                "minimum_amount": 10000,
                "maximum_amount": 250000,
                "base_interest_rate": 12.0,
                "max_tenure_months": 9,
                "minimum_score": 50,
            },
            {
                "name": "Agri Input Facility",
                "description": "Seasonal credit aligned to farm inputs and harvest windows.",
                "sector_tag": "agriculture",
                "minimum_amount": 10000,
                "maximum_amount": 500000,
                "base_interest_rate": 13.0,
                "max_tenure_months": 8,
                "minimum_score": 52,
            },
        ]
        for item in defaults:
            LoanProduct.objects.get_or_create(name=item["name"], defaults=item)
        return LoanProduct.objects.filter(is_active=True)


class LoanApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = LoanApplicationSerializer

    def get_queryset(self):
        return LoanApplication.objects.filter(user=self.request.user).select_related("product")
