from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.banking.views import LedgerEntryViewSet, TransferViewSet, WalletView
from apps.engagement.views import NotificationViewSet
from apps.investments.views import InvestmentHoldingViewSet, InvestmentProductViewSet
from apps.loans.views import LoanApplicationViewSet, LoanProductViewSet

router = DefaultRouter()
router.register("transfers", TransferViewSet, basename="transfer")
router.register("ledger", LedgerEntryViewSet, basename="ledger")
router.register("loan-products", LoanProductViewSet, basename="loan-product")
router.register("loan-applications", LoanApplicationViewSet, basename="loan-application")
router.register("investment-products", InvestmentProductViewSet, basename="investment-product")
router.register("investment-holdings", InvestmentHoldingViewSet, basename="investment-holding")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/wallet/", WalletView.as_view(), name="wallet"),
    path("api/v1/", include(router.urls)),
]
