# receipts/services.py
import uuid
from datetime import datetime
from django.template.loader import render_to_string
from django.conf import settings
from .models import Receipt
from payments.models import Payment
from weasyprint import HTML
import tempfile

class ReceiptGenerator:
    @staticmethod
    def generate_receipt(payment):
        """Generate a receipt for a successful payment"""
        from accounts.models import CustomUser
        
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
        """Generate HTML for receipt (used for PDF)"""
        receipt_data = receipt.receipt_data
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <title>Receipt {receipt.serial_number}</title>
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; }}
            .header {{ text-align: center; border-bottom: 2px solid #4a7c59; padding-bottom: 15px; margin-bottom: 20px; }}
            .header h1 {{ color: #4a7c59; }}
            .details {{ margin: 15px 0; }}
            .details div {{ display: flex; justify-content: space-between; margin: 5px 0; }}
            .amount {{ font-size: 22px; font-weight: bold; color: #4a7c59; text-align: center; margin: 20px 0; }}
            .footer {{ text-align: center; font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; }}
        </style>
        </head>
        <body>
            <div class="header">
                <h1>PAYMENT RECEIPT</h1>
                <p>Receipt #{receipt.serial_number}</p>
            </div>
            <div class="details">
                <div><span>Transaction Time:</span><span>{receipt_data['transaction_time']}</span></div>
                <div><span>Phone:</span><span>{receipt_data['masked_phone_number']}</span></div>
                <div><span>Amount:</span><span>KSH {receipt_data['amount']}</span></div>
                <div><span>Description:</span><span>{receipt_data['description']}</span></div>
                <div><span>Payment Method:</span><span>{receipt_data['payment_method']}</span></div>
                <div><span>Status:</span><span>{receipt_data['status']}</span></div>
                <div><span>Initiated By:</span><span>{receipt_data['initiated_by']}</span></div>
                <div><span>Reference ID:</span><span>{receipt_data['reference_id']}</span></div>
            </div>
            <div class="amount">KSH {receipt_data['amount']}</div>
            <div class="footer">
                <p>{receipt_data['business_name']}</p>
                <p>{receipt_data['business_address']}</p>
                <p>Contact: {receipt_data['business_contact']}</p>
                <p>All rights reserved</p>
            </div>
        </body>
        </html>
        """
        return html_content

    @staticmethod
    def generate_pdf(receipt):
        """Return PDF bytes for a receipt"""
        html_content = ReceiptGenerator.generate_receipt_html(receipt)
        with tempfile.NamedTemporaryFile(delete=True) as tmp_file:
            HTML(string=html_content).write_pdf(target=tmp_file.name)
            tmp_file.seek(0)
            pdf_bytes = tmp_file.read()
        return pdf_bytes
