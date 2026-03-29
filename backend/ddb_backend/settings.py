from pathlib import Path
from urllib.parse import unquote, urlparse

from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent


def _split_csv(value: str):
    return [item.strip() for item in value.split(",") if item.strip()]


def _normalize_host(value: str):
    host = value.strip()
    if not host:
        return ""
    if "://" in host:
        host = urlparse(host).netloc or ""
    if "/" in host:
        host = host.split("/")[0]
    if ":" in host:
        host = host.split(":")[0]
    return host.lower().strip()


def _normalize_origin(value: str):
    origin = value.strip()
    if not origin:
        return ""
    if "://" not in origin:
        return ""
    parsed = urlparse(origin)
    if not parsed.scheme or not parsed.netloc:
        return ""
    return f"{parsed.scheme}://{parsed.netloc}"

SECRET_KEY = config("DJANGO_SECRET_KEY", default="django-insecure-change-me-in-production!!")
DEBUG = config("DJANGO_DEBUG", cast=bool, default=True)
raw_allowed_hosts = _split_csv(config("DJANGO_ALLOWED_HOSTS", default="127.0.0.1,localhost"))
ALLOWED_HOSTS = [_normalize_host(host) for host in raw_allowed_hosts if _normalize_host(host)]
if not DEBUG and ".onrender.com" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(".onrender.com")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "apps.accounts",
    "apps.banking",
    "apps.loans",
    "apps.investments",
    "apps.engagement",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "ddb_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "ddb_backend.wsgi.application"
ASGI_APPLICATION = "ddb_backend.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
database_url = config("DATABASE_URL", default="")
if database_url:
    parsed = urlparse(database_url)
    DATABASES["default"] = {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": unquote(parsed.path.lstrip("/")),
        "USER": unquote(parsed.username or ""),
        "PASSWORD": unquote(parsed.password or ""),
        "HOST": parsed.hostname or "",
        "PORT": str(parsed.port or ""),
        "CONN_MAX_AGE": 600,
        "OPTIONS": {"sslmode": "require"},
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Lagos"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

raw_cors_allowed_origins = _split_csv(config("DJANGO_CORS_ALLOWED_ORIGINS", default=""))
cors_allowed_origins = [_normalize_origin(origin) for origin in raw_cors_allowed_origins if _normalize_origin(origin)]
raw_csrf_trusted_origins = _split_csv(config("DJANGO_CSRF_TRUSTED_ORIGINS", default=""))
csrf_trusted_origins = [_normalize_origin(origin) for origin in raw_csrf_trusted_origins if _normalize_origin(origin)]

CORS_ALLOW_ALL_ORIGINS = DEBUG and not cors_allowed_origins
CORS_ALLOWED_ORIGINS = cors_allowed_origins
CSRF_TRUSTED_ORIGINS = csrf_trusted_origins
if not DEBUG and not CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://.*\.onrender\.com$"]
if not DEBUG and not CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS = ["https://*.onrender.com"]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_SSL_REDIRECT = not DEBUG
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG

CELERY_BROKER_URL = config("CELERY_BROKER_URL", default="redis://127.0.0.1:6379/0")
CELERY_RESULT_BACKEND = config("CELERY_RESULT_BACKEND", default=CELERY_BROKER_URL)
