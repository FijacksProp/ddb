from django.db.models import Q
from decimal import Decimal
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.banking.models import LedgerEntry, Transfer
from apps.banking.serializers import LedgerEntrySerializer, TransferSerializer, WalletSerializer
from apps.banking.services import WalletService


class WalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = WalletSerializer(request.user.wallet)
        return Response(serializer.data)

    def post(self, request):
        amount = request.data.get("amount")
        try:
            amount = Decimal(str(amount))
        except Exception:
            return Response({"detail": "Invalid amount"}, status=400)
        if amount <= 0:
            return Response({"detail": "Amount must be greater than zero"}, status=400)
        WalletService.credit_wallet(
            user=request.user,
            amount=amount,
            category="top_up",
            description="Wallet top up",
        )
        serializer = WalletSerializer(request.user.wallet)
        return Response(serializer.data, status=201)


class LedgerEntryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LedgerEntrySerializer

    def get_queryset(self):
        return LedgerEntry.objects.filter(wallet=self.request.user.wallet)


class TransferViewSet(viewsets.ModelViewSet):
    serializer_class = TransferSerializer

    def get_queryset(self):
        return Transfer.objects.filter(Q(sender=self.request.user) | Q(recipient=self.request.user)).select_related("sender", "recipient")
