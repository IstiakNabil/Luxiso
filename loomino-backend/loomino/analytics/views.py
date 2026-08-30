from django.http import JsonResponse

from .services import dashboard_statistics


def dashboard_summary(request):
    return JsonResponse(dashboard_statistics())