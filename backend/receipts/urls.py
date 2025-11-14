# receipts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.ReceiptListView.as_view(), name='receipt-list'),
    path('<int:pk>/', views.ReceiptDetailView.as_view(), name='receipt-detail'),
    path('generate/<int:payment_id>/', views.ReceiptGenerateView.as_view(), name='receipt-generate'),
    path('export/<int:pk>/', views.ReceiptExportView.as_view(), name='receipt-export'),
    path('payment/<str:payment_reference_id>/', views.get_receipt_by_payment, name='receipt-by-payment'),
]