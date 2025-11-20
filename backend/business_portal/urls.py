# business_portal/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse, JsonResponse

def root_view(request):
    return HttpResponse("Welcome to Business Portal API")

def api_root_view(request):
    return JsonResponse({
        "message": "Business Portal API",
        "endpoints": {
            "accounts": "/api/accounts/",
            "payments": "/api/payments/",
            "receipts": "/api/receipts/",
            "health": "/api/health/"  # optional, if you add it later
        }
    })

urlpatterns = [
    path('', root_view),
    path('admin/', admin.site.urls),
    path('api/', api_root_view),  # ← ADD THIS LINE
    path('api/accounts/', include('accounts.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/receipts/', include('receipts.urls')),
]