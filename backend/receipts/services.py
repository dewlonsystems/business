# receipts/services.py
import uuid
from datetime import datetime
from django.conf import settings
from .models import Receipt
from payments.models import Payment
from io import BytesIO
import pdfkit
from openpyxl import Workbook

class ReceiptGenerator:
    @staticmethod
    def generate_receipt(payment):
        """Generate a receipt for a successful payment"""
        from accounts.models import CustomUser

        # Minimal data for lightweight receipt
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
        }

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
        """Generate minimal HTML for PDF export"""
        r = receipt.receipt_data
        html_content = f"""
        <div style="font-family:Arial,sans-serif;font-size:12px;max-width:400px;margin:auto;">
            <h2 style="color:#4a7c59;">PAYMENT RECEIPT</h2>
            <p><strong>Serial:</strong> {r['serial_number']}</p>
            <p><strong>Transaction:</strong> {r['transaction_time']}</p>
            <p><strong>Phone:</strong> {r['masked_phone_number']}</p>
            <p><strong>Amount:</strong> KSH {r['amount']}</p>
            <p><strong>Description:</strong> {r['description']}</p>
            <p><strong>Reference:</strong> {r['reference_id']}</p>
            <p><strong>Status:</strong> {r['status']}</p>
            <p><strong>Initiated By:</strong> {r['initiated_by']}</p>
        </div>
        """
        return html_content

    @staticmethod
    def generate_receipt_pdf_bytes(receipt):
        """Generate PDF in memory"""
        html = ReceiptGenerator.generate_receipt_html(receipt)
        pdf_bytes = pdfkit.from_string(html, False)  # returns bytes
        return pdf_bytes

    @staticmethod
    def generate_receipt_excel_bytes(receipt):
        """Generate Excel in memory"""
        r = receipt.receipt_data
        wb = Workbook()
        ws = wb.active
        ws.append(['Serial', 'Transaction Time', 'Phone', 'Amount', 'Description', 'Reference', 'Status', 'Initiated By'])
        ws.append([
            r['serial_number'],
            r['transaction_time'],
            r['masked_phone_number'],
            r['amount'],
            r['description'],
            r['reference_id'],
            r['status'],
            r['initiated_by']
        ])
        stream = BytesIO()
        wb.save(stream)
        return stream.getvalue()
