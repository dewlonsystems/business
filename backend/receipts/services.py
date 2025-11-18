# receipts/services.py
import uuid
from datetime import datetime
from django.template.loader import render_to_string
from django.conf import settings
from .models import Receipt
from payments.models import Payment
import pdfkit  # pip install pdfkit
import os

class ReceiptGenerator:
    @staticmethod
    def generate_receipt(payment):
        """Generate a receipt for a successful payment"""
        from accounts.models import CustomUser
        
        # Create receipt data
        receipt_data = {
            'transaction_time': payment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'masked_phone_number': ReceiptGenerator.mask_phone_number(payment.phone_number),
            'amount': f"{payment.amount:,.2f}",
            'description': payment.description or 'Payment',
            'reference_id': payment.reference_id,
            'initiated_by': f"{payment.initiated_by.first_name} {payment.initiated_by.last_name}",
            'payment_method': payment.get_payment_method_display(),
            'status': payment.get_status_display(),
            'serial_number': f"SER_{datetime.now().strftime('%Y%m%d')}_{str(uuid.uuid4())[:8].upper()}",
            'business_name': 'Dewlon Systems',
            'business_address': 'Your business address here',
            'business_contact': '0728722746',
        }
        
        # Create the receipt
        receipt = Receipt.objects.create(
            payment=payment,
            staff_member=payment.initiated_by,
            serial_number=receipt_data['serial_number'],
            receipt_data=receipt_data
        )
        return receipt

    @staticmethod
    def mask_phone_number(phone_number):
        if len(phone_number) > 4:
            return phone_number[:-4] + '****'
        return phone_number

    @staticmethod
    def generate_receipt_html(receipt):
        """Render receipt HTML from template"""
        return render_to_string('receipts/receipt_template.html', {'receipt': receipt})

    @staticmethod
    def generate_receipt_pdf_bytes(receipt):
        """Generate PDF bytes from HTML template"""
        html = ReceiptGenerator.generate_receipt_html(receipt)
        # Optional: configure wkhtmltopdf path if needed
        options = {
            'page-size': 'A4',
            'encoding': "UTF-8",
            'quiet': ''
        }
        pdf_bytes = pdfkit.from_string(html, False, options=options)
        return pdf_bytes
