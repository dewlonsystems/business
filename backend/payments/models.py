from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import CustomUser

class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('initiated', 'Initiated'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('timeout', 'Timeout'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('mpesa', 'Mpesa'),
        ('paystack', 'Paystack'),
        ('qr', 'QR Code'),
    )
    
    reference_id = models.CharField(max_length=100, unique=True, editable=False)
    phone_number = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='mpesa')
    initiated_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='initiated_payments')
    mpesa_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    paystack_reference = models.CharField(max_length=100, blank=True, null=True)
    response_data = models.JSONField(default=dict, blank=True)  # Store API responses
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment {self.reference_id} - {self.amount} - {self.status}"
    
    def save(self, *args, **kwargs):
        if not self.reference_id:
            import uuid
            self.reference_id = str(uuid.uuid4())
        super().save(*args, **kwargs)