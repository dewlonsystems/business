# receipts/views.py
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import Receipt
from .serializers import ReceiptSerializer
from payments.models import Payment
from .services import ReceiptGenerator

class ReceiptListView(generics.ListAPIView):
    queryset = Receipt.objects.all().select_related('payment', 'staff_member').order_by('-generated_at')
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

class ReceiptDetailView(generics.RetrieveAPIView):
    queryset = Receipt.objects.all().select_related('payment', 'staff_member')
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

class ReceiptGenerateView(generics.CreateAPIView):
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        payment_id = self.kwargs.get('payment_id')
        payment = get_object_or_404(Payment, id=payment_id)
        
        # Check if receipt already exists
        existing_receipt = Receipt.objects.filter(payment=payment).first()
        if existing_receipt:
            return existing_receipt
        
        # Generate new receipt
        receipt = ReceiptGenerator.generate_receipt(payment)
        return receipt

    def create(self, request, *args, **kwargs):
        payment_id = self.kwargs.get('payment_id')
        payment = get_object_or_404(Payment, id=payment_id)
        
        # Check if receipt already exists
        existing_receipt = Receipt.objects.filter(payment=payment).first()
        if existing_receipt:
            serializer = self.get_serializer(existing_receipt)
            return Response(serializer.data)
        
        # Generate new receipt
        receipt = ReceiptGenerator.generate_receipt(payment)
        serializer = self.get_serializer(receipt)
        return Response(serializer.data, status=201)

class ReceiptExportView(generics.RetrieveAPIView):
    queryset = Receipt.objects.all()
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        receipt = self.get_object()
        
        # Get the HTML content
        html_content = ReceiptGenerator.generate_receipt_html(receipt)
        
        # Return as HTML response for now (later we can add PDF generation)
        response = HttpResponse(html_content, content_type='text/html')
        response['Content-Disposition'] = f'attachment; filename="receipt_{receipt.receipt_number}.html"'
        return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_receipt_by_payment(request, payment_reference_id):
    """Get receipt by payment reference ID"""
    payment = get_object_or_404(Payment, reference_id=payment_reference_id)
    receipt = Receipt.objects.filter(payment=payment).first()
    
    if not receipt:
        return Response({'error': 'Receipt not found'}, status=404)
    
    serializer = ReceiptSerializer(receipt)
    return Response(serializer.data)