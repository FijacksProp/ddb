import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ddb_backend.settings")

app = Celery("ddb_backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
