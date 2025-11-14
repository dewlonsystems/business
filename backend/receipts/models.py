from django.db import models
from payments.models import Payment
from accounts.models import CustomUser

class Receipt(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='receipt')
    receipt_number = models.CharField(max_length=50, unique=True, editable=False)
    serial_number = models.CharField(max_length=50, unique=True)
    staff_member = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='receipts')
    generated_at = models.DateTimeField(auto_now_add=True)
    receipt_data = models.JSONField()  # Store receipt details
    
    def __str__(self):
        return f"Receipt {self.receipt_number} for Payment {self.payment.reference_id}"
    
    def save(self, *args, **kwargs):
        if not self.receipt_number:
            import uuid
            from datetime import datetime
            self.receipt_number = f"RCP_{datetime.now().strftime('%Y%m%d')}_{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)