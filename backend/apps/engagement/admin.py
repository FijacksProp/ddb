from django.contrib import admin
from .models import Notification, AuditLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "kind", "read", "created_at")
    list_filter = ("kind", "read", "created_at")
    search_fields = ("user__email", "title")
    readonly_fields = ("id", "created_at")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("actor", "action", "created_at")
    list_filter = ("action", "created_at")
    search_fields = ("actor__email", "action")
    readonly_fields = ("id", "created_at")
