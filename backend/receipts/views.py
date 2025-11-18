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

    def create(self, request, *args, **kwargs):
        payment_id = self.kwargs.get('payment_id')
        payment = get_object_or_404(Payment, id=payment_id)

        # Check if receipt exists
        receipt = Receipt.objects.filter(payment=payment).first()
        if not receipt:
            receipt = ReceiptGenerator.generate_receipt(payment)

        serializer = self.get_serializer(receipt)
        return Response(serializer.data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_receipt_pdf(request, receipt_id):
    """Download receipt as PDF"""
    receipt = get_object_or_404(Receipt, id=receipt_id)
    pdf_bytes = ReceiptGenerator.generate_receipt_pdf_bytes(receipt)
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="receipt_{receipt.serial_number}.pdf"'
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_receipt_excel(request, receipt_id):
    """Export receipt as Excel"""
    receipt = get_object_or_404(Receipt, id=receipt_id)
    excel_bytes = ReceiptGenerator.generate_receipt_excel_bytes(receipt)
    response = HttpResponse(excel_bytes, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename="receipt_{receipt.serial_number}.xlsx"'
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_receipt_by_payment(request, payment_reference_id):
    payment = get_object_or_404(Payment, reference_id=payment_reference_id)
    receipt = Receipt.objects.filter(payment=payment).first()
    if not receipt:
        return Response({'error': 'Receipt not found'}, status=404)
    serializer = ReceiptSerializer(receipt)
    return Response(serializer.data)
