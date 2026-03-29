from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.accounts.serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)


class UserDirectoryView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            self.request.user.__class__.objects.exclude(id=self.request.user.id)
            .only("id", "full_name", "account_number", "segment", "email", "phone_number")
            .order_by("full_name")
        )


class BVNVerificationView(ViewSet):
    """Handle BVN verification for users"""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["post"], url_path="verify-bvn")
    def verify_bvn(self, request):
        """Verify BVN for current user"""
        user = request.user
        bvn = request.data.get("bvn", "").strip()

        if not bvn:
            return Response(
                {"error": "BVN is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(bvn) != 11:
            return Response(
                {"error": "BVN must be 11 digits"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not bvn.isdigit():
            return Response(
                {"error": "BVN must contain only digits"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update user BVN and mark as verified
        user.bvn = bvn
        user.is_bvn_verified = True
        user.save()

        serializer = UserSerializer(user)
        return Response(
            {
                "message": "BVN verified successfully",
                "user": serializer.data
            },
            status=status.HTTP_200_OK
        )
