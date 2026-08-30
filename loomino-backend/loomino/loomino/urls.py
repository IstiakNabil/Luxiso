from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)



urlpatterns = [
    # Renamed from the Django default "admin/" -- the React app's own
    # admin panel already owns that path client-side (e.g.
    # /admin/login, /admin/products). Keeping both at "admin/" would
    # mean nginx has to guess whether a request is meant for Django's
    # built-in admin or the React SPA; renaming this one removes the
    # ambiguity entirely, and doubles as the usual security practice
    # of not leaving Django's admin at the well-known default path.
    path("django-admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("api/pos/", include("pos.urls")),

path(
    "api/schema/",
    SpectacularAPIView.as_view(),
    name="schema",
),

path(
    "api/docs/",
    SpectacularSwaggerView.as_view(
        url_name="schema"
    ),
    name="swagger-ui",
),

path(
    "api/redoc/",
    SpectacularRedocView.as_view(
        url_name="schema"
    ),
    name="redoc",
),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)