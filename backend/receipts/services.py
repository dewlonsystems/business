# receipts/services.py
import uuid
from datetime import datetime
from django.template.loader import render_to_string
from django.conf import settings
from .models import Receipt
from payments.models import Payment

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
            'business_name': 'Dewlon Systems',  # Your business name
            'business_address': 'Your business address here',
            'business_contact': '0728722746',  # Your contact
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
        """Mask the phone number for privacy"""
        if len(phone_number) > 4:
            return phone_number[:-4] + '****'
        return phone_number
    
    @staticmethod
    def generate_receipt_html(receipt):
        """Generate HTML for receipt"""
        receipt_data = receipt.receipt_data
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt - {receipt.receipt_number}</title>
            <style>
                body {{ font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .receipt-header {{ text-align: center; border-bottom: 2px solid #4a7c59; padding-bottom: 15px; margin-bottom: 20px; }}
                .receipt-title {{ color: #4a7c59; font-size: 24px; font-weight: bold; }}
                .receipt-details {{ margin: 15px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; margin: 5px 0; }}
                .detail-label {{ font-weight: bold; color: #333; }}
                .detail-value {{ color: #666; }}
                .amount {{ font-size: 20px; font-weight: bold; color: #4a7c59; text-align: center; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="receipt-header">
                <div class="receipt-title">PAYMENT RECEIPT</div>
                <div>Receipt #{receipt.receipt_number}</div>
            </div>
            
            <div class="receipt-details">
                <div class="detail-row">
                    <span class="detail-label">Serial Number:</span>
                    <span class="detail-value">{receipt_data['serial_number']}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transaction Time:</span>
                    <span class="detail-value">{receipt_data['transaction_time']}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone Number:</span>
                    <span class="detail-value">{receipt_data['masked_phone_number']}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">KSH {receipt_data['amount']}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Description:</span>
                    <span class="detail-value">{receipt_data['description']}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">{receipt_data['payment_method']}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">{receipt_data['status']}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Initiated By:</span>
                    <span class="detail-value">{receipt_data['initiated_by']}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Reference ID:</span>
                    <span class="detail-value">{receipt_data['reference_id']}</span>
                </div>
            </div>
            
            <div class="amount">KSH {receipt_data['amount']}</div>
            
            <div class="footer">
                <div>{receipt_data['business_name']}</div>
                <div>{receipt_data['business_address']}</div>
                <div>Contact: {receipt_data['business_contact']}</div>
                <div>All rights reserved</div>
            </div>
        </body>
        </html>
        """
        
        return html_content
