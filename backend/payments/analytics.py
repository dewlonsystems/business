from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from .models import Payment
from accounts.models import CustomUser
from datetime import datetime, timedelta
from django.utils import timezone

class PaymentAnalytics:
    @staticmethod
    def get_daily_summary(start_date=None, end_date=None):
        """Get daily payment summary"""
        payments = Payment.objects.all()
        
        if start_date:
            payments = payments.filter(created_at__date__gte=start_date)
        if end_date:
            payments = payments.filter(created_at__date__lte=end_date)
        
        daily_summary = payments.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total_amount=Sum('amount'),
            total_count=Count('id'),
            success_count=Count('id', filter=Payment.objects.filter(status='success')),
            failed_count=Count('id', filter=Payment.objects.filter(status='failed')),
        ).order_by('-date')
        
        return list(daily_summary)
    
    @staticmethod
    def get_user_summary(user_type=None):
        """Get payment summary by user type"""
        payments = Payment.objects.all()
        
        if user_type:
            payments = payments.filter(initiated_by__user_type=user_type)
        
        user_summary = payments.values(
            'initiated_by__username',
            'initiated_by__first_name',
            'initiated_by__last_name',
            'initiated_by__user_type'
        ).annotate(
            total_amount=Sum('amount'),
            total_count=Count('id'),
            success_count=Count('id', filter=Payment.objects.filter(status='success')),
        ).order_by('-total_amount')
        
        return list(user_summary)
    
    @staticmethod
    def get_overall_stats():
        """Get overall payment statistics"""
        total_payments = Payment.objects.count()
        successful_payments = Payment.objects.filter(status='success').count()
        total_amount = Payment.objects.filter(status='success').aggregate(Sum('amount'))['amount__sum'] or 0
        
        stats = {
            'total_payments': total_payments,
            'successful_payments': successful_payments,
            'failed_payments': total_payments - successful_payments,
            'success_rate': (successful_payments / total_payments * 100) if total_payments > 0 else 0,
            'total_amount_processed': total_amount,
        }
        
        return stats