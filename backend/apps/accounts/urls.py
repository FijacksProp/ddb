from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import MeView, RegisterView, BVNVerificationView, UserDirectoryView

router = DefaultRouter()
router.register(r"bvn", BVNVerificationView, basename="bvn-verification")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("users/", UserDirectoryView.as_view(), name="users"),
] + router.urls
