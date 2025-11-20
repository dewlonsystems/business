from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def root_view(request):
    return HttpResponse("Welcome to Business Portal API")

urlpatterns = [
    path('', root_view),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/receipts/', include('receipts.urls')),
]