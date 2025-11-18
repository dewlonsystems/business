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
import pdfkit
import io
import pandas as pd

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

class ReceiptExportPDFView(generics.RetrieveAPIView):
    queryset = Receipt.objects.all()
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        receipt = self.get_object()
        
        # Generate HTML content
        html_content = ReceiptGenerator.generate_receipt_html(receipt)
        
        # Convert HTML to PDF
        pdf_file = pdfkit.from_string(html_content, False)
        
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="receipt_{receipt.receipt_number}.pdf"'
        return response

class ReceiptExportExcelView(generics.RetrieveAPIView):
    queryset = Receipt.objects.all()
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        receipt = self.get_object()
        data = receipt.receipt_data
        
        # Prepare data for Excel
        df = pd.DataFrame([{
            "Serial Number": data['serial_number'],
            "Transaction Time": data['transaction_time'],
            "Phone Number": data['masked_phone_number'],
            "Amount": data['amount'],
            "Description": data['description'],
            "Payment Method": data['payment_method'],
            "Status": data['status'],
            "Initiated By": data['initiated_by'],
            "Reference ID": data['reference_id'],
            "Business Name": data['business_name'],
            "Business Address": data['business_address'],
            "Business Contact": data['business_contact'],
        }])
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Receipt')
            writer.save()
        
        output.seek(0)
        response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="receipt_{receipt.receipt_number}.xlsx"'
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
