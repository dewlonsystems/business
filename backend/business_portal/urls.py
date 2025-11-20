from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', root_view),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/receipts/', include('receipts.urls')),
]