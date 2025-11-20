import requests
import json
from django.conf import settings
from django.core.exceptions import ValidationError
from .models import Payment
from decouple import config
import hashlib
import hmac
import base64
from datetime import datetime

class MpesaService:
    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.business_short_code = settings.MPESA_BUSINESS_SHORT_CODE
        self.passkey = settings.MPESA_PASSKEY
        self.callback_url = settings.MPESA_CALLBACK_URL
        # Always use live environment
        self.base_url = 'https://api.safaricom.co.ke'
    
    def get_access_token(self):
        """Get OAuth access token for Mpesa API"""
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        
        response = requests.get(
            url,
            auth=(self.consumer_key, self.consumer_secret)
        )
        
        if response.status_code == 200:
            return response.json()['access_token']
        else:
            raise Exception(f"Failed to get access token: {response.text}")
    
    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """Initiate STK Push for payment"""
        access_token = self.get_access_token()
        
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Generate password
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = f"{self.business_short_code}{self.passkey}{timestamp}"
        encoded_password = base64.b64encode(password.encode()).decode()
        
        payload = {
            "BusinessShortCode": self.business_short_code,
            "Password": encoded_password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": self.business_short_code,
            "PhoneNumber": phone_number,
            "CallBackURL": self.callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    def register_url(self):
        """Register callback URLs with Mpesa"""
        access_token = self.get_access_token()
        
        url = f"{self.base_url}/mpesa/c2b/v1/registerurl"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "ValidationURL": f"{self.callback_url}/validation",
            "ConfirmationURL": f"{self.callback_url}/confirmation",
            "ResponseType": "Completed",
            "BusinessShortCode": self.business_short_code
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()

    def query_transaction_status(self, checkout_request_id):
        """Query the status of an STK push transaction"""
        access_token = self.get_access_token()
        
        url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = f"{self.business_short_code}{self.passkey}{timestamp}"
        encoded_password = base64.b64encode(password.encode()).decode()
        
        payload = {
            "BusinessShortCode": self.business_short_code,
            "Password": encoded_password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()

class PaystackService:
    def __init__(self):
        self.secret_key = config('PAYSTACK_SECRET_KEY', default='')
        self.public_key = config('PAYSTACK_PUBLIC_KEY', default='')
        self.base_url = 'https://api.paystack.co'
        self.frontend_url = config('FRONTEND_URL', default='http://localhost:3000')
    
    def initialize_transaction(self, email, amount, phone_number, reference):
        """Initialize a Paystack transaction"""
        url = f"{self.base_url}/transaction/initialize"
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        # Amount in kobo (multiply by 100)
        amount_kobo = int(float(amount) * 100)
        
        payload = {
            "email": email,
            "amount": amount_kobo,
            "reference": reference,
            "metadata": {
                "phone_number": phone_number,
                "custom_fields": [
                    {
                        "display_name": "Mobile Number",
                        "variable_name": "mobile_number",
                        "value": phone_number
                    }
                ]
            },
            "callback_url": f"{self.frontend_url}/payment-status/{reference}",
            "channels": ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"]
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()
    
    def verify_transaction(self, reference):
        """Verify a Paystack transaction"""
        url = f"{self.base_url}/transaction/verify/{reference}"
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
        }
        
        response = requests.get(url, headers=headers)
        return response.json()
    
    def charge_authorization(self, authorization_code, email, amount):
        """Charge a customer using their authorization code"""
        url = f"{self.base_url}/transaction/charge_authorization"
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        amount_kobo = int(float(amount) * 100)
        
        payload = {
            "authorization_code": authorization_code,
            "email": email,
            "amount": amount_kobo
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()
    
    def create_customer(self, email, first_name=None, last_name=None, phone=None):
        """Create a Paystack customer"""
        url = f"{self.base_url}/customer"
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "phone": phone
        }
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()

class PaymentProcessor:
    @staticmethod
    def validate_phone_number(phone_number):
        """Validate phone number format"""
        # Remove any spaces or dashes
        clean_number = phone_number.replace(' ', '').replace('-', '')
        
        # Ensure it starts with + or 0
        if clean_number.startswith('+'):
            clean_number = clean_number[1:]
        elif clean_number.startswith('0'):
            # Convert to international format (assuming Kenya)
            clean_number = '254' + clean_number[1:]
        
        # Validate length (Kenya numbers are 12 digits in international format)
        if len(clean_number) != 12:
            raise ValidationError("Invalid phone number format")
        
        return clean_number
    
    @staticmethod
    def validate_amount(amount):
        """Validate amount"""
        if amount <= 0:
            raise ValidationError("Amount must be greater than 0")
        
        if amount > 1000000:  # Example limit of 1,000,000
            raise ValidationError("Amount exceeds maximum allowed limit")
        
        return amount
    
    @staticmethod
    def process_payment(payment):
        """Process payment based on method"""
        try:
            # Validate phone number and amount
            validated_phone = PaymentProcessor.validate_phone_number(payment.phone_number)
            validated_amount = PaymentProcessor.validate_amount(payment.amount)
            
            # Update payment with validated data
            payment.phone_number = validated_phone
            payment.amount = validated_amount
            payment.status = 'initiated'
            payment.save()
            
            if payment.payment_method == 'mpesa':
                mpesa_service = MpesaService()
                result = mpesa_service.initiate_stk_push(
                    phone_number=validated_phone,
                    amount=validated_amount,
                    account_reference=f"PAY-{payment.reference_id}",
                    transaction_desc=payment.description or "Payment"
                )
                
                # Update payment with Mpesa response
                payment.response_data = result
                if 'errorCode' in result:
                    payment.status = 'failed'
                    payment.mpesa_transaction_id = result.get('errorMessage', 'Error')
                else:
                    payment.status = 'processing'
                    payment.mpesa_transaction_id = result.get('CheckoutRequestID')
                
            elif payment.payment_method == 'paystack':
                paystack_service = PaystackService()
                
                # Use email from user or create a placeholder
                email = f"customer{validated_phone}@example.com"
                if payment.initiated_by and payment.initiated_by.email:
                    email = payment.initiated_by.email
                
                result = paystack_service.initialize_transaction(
                    email=email,
                    amount=validated_amount,
                    phone_number=validated_phone,
                    reference=payment.reference_id
                )
                
                # Update payment with Paystack response
                payment.response_data = result
                if result.get('status'):
                    payment.status = 'processing'
                    payment.paystack_reference = result['data']['reference']
                    payment.response_data['authorization_url'] = result['data']['authorization_url']
                else:
                    payment.status = 'failed'
                    payment.paystack_reference = result.get('message', 'Error')
            
            payment.save()
            return payment
            
        except ValidationError as e:
            payment.status = 'failed'
            payment.response_data = {'error': str(e)}
            payment.save()
            return payment
        except Exception as e:
            payment.status = 'failed'
            payment.response_data = {'error': str(e)}
            payment.save()
            return payment