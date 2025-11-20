from django.urls import path
from . import views

urlpatterns = [
    path('initiate/', views.PaymentInitiateView.as_view(), name='payment-initiate'),
    path('status/<str:reference_id>/', views.PaymentStatusView.as_view(), name='payment-status'),
    path('list/', views.PaymentListView.as_view(), name='payment-list'),
    path('verify/<str:reference_id>/', views.verify_payment, name='payment-verify'),
    path('mpesa/callback/', views.mpesa_callback, name='mpesa-callback'),
    path('webhook/', views.paystack_webhook, name='paystack-webhook'),
    path('analytics/daily/', views.daily_summary, name='daily-summary'),
    path('analytics/user/', views.user_summary, name='user-summary'),
    path('analytics/stats/', views.overall_stats, name='overall-stats'),
]