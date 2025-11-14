from rest_framework import serializers
from .models import Receipt
from payments.serializers import PaymentSerializer

class ReceiptSerializer(serializers.ModelSerializer):
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = Receipt
        fields = '__all__'
        read_only_fields = ('receipt_number', 'generated_at')