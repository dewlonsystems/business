from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.views.decorators.cache import never_cache
from .models import Payment
from .serializers import PaymentSerializer
from .services import PaymentProcessor, PaystackService
import json

class PaymentInitiateView(generics.CreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(initiated_by=request.user)
        
        # Process the payment
        processed_payment = PaymentProcessor.process_payment(payment)
        
        # If Paystack, return the authorization URL for frontend redirect
        if processed_payment.payment_method == 'paystack' and processed_payment.status == 'processing':
            response_data = PaymentSerializer(processed_payment).data
            response_data['authorization_url'] = processed_payment.response_data.get('authorization_url')
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        # Return the updated payment data
        response_serializer = self.get_serializer(processed_payment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class PaymentStatusView(generics.RetrieveAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'reference_id'

class PaymentListView(generics.ListAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return Payment.objects.all().order_by('-created_at')
        elif user.user_type == 'staff':
            return Payment.objects.filter(initiated_by=user).order_by('-created_at')
        elif user.user_type == 'auditor':
            return Payment.objects.all().order_by('-created_at')  # Auditors can see all but not modify
        return Payment.objects.none()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request, reference_id):
    """Verify payment status for Paystack transactions"""
    payment = get_object_or_404(Payment, reference_id=reference_id)
    
    if payment.payment_method == 'paystack':
        paystack_service = PaystackService()
        result = paystack_service.verify_transaction(payment.paystack_reference)
        
        if result.get('status'):
            status_map = {
                'failed': 'failed',
                'success': 'success',
                'cancelled': 'cancelled'
            }
            
            paystack_status = result['data']['status']
            payment.status = status_map.get(paystack_status, 'failed')
            payment.response_data = result
            payment.save()
            
            # Generate receipt if payment is successful
            if payment.status == 'success':
                from receipts.models import Receipt
                receipt_exists = Receipt.objects.filter(payment=payment).exists()
                if not receipt_exists:
                    from receipts.services import ReceiptGenerator
                    ReceiptGenerator.generate_receipt(payment)
        
        return Response({
            'status': payment.status,
            'result': result
        })
    
    return Response({'error': 'Verification only available for Paystack'}, 
                   status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow external callbacks
def mpesa_callback(request):
    """Handle Mpesa callback"""
    try:
        # Parse the callback data
        callback_data = request.data
        
        # Extract checkout request ID from callback
        checkout_request_id = callback_data.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID')
        
        if checkout_request_id:
            # Find the payment by Mpesa transaction ID
            payment = Payment.objects.filter(mpesa_transaction_id=checkout_request_id).first()
            
            if payment:
                # Update payment status based on callback
                stk_callback = callback_data.get('Body', {}).get('stkCallback', {})
                result_code = stk_callback.get('ResultCode')
                
                if result_code == 0:
                    payment.status = 'success'
                elif result_code == 1032:  # User cancelled
                    payment.status = 'cancelled'
                elif result_code == 1037:  # Timeout
                    payment.status = 'timeout'
                else:
                    payment.status = 'failed'
                
                payment.response_data = callback_data
                payment.save()
                
                # Generate receipt if payment is successful
                if payment.status == 'success':
                    from receipts.models import Receipt
                    receipt_exists = Receipt.objects.filter(payment=payment).exists()
                    if not receipt_exists:
                        from receipts.services import ReceiptGenerator
                        ReceiptGenerator.generate_receipt(payment)
        
        return Response({'Result': 'Success'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def paystack_webhook(request):
    """Handle Paystack webhook"""
    if request.method == 'POST':
        # Verify webhook signature
        import hashlib
        import hmac
        
        secret = "your_paystack_webhook_secret_here"  # Replace with your actual webhook secret
        signature = request.META.get('HTTP_X_PAYSTACK_SIGNATURE')
        
        if signature:
            expected_signature = hmac.new(
                secret.encode('utf-8'),
                request._request.body,
                hashlib.sha512
            ).hexdigest()
            
            if hmac.compare_digest(signature, expected_signature):
                # Process the webhook
                payload = json.loads(request._request.body)
                event = payload.get('event')
                
                if event == 'charge.success':
                    reference = payload['data']['reference']
                    # Find payment by reference
                    payment = Payment.objects.filter(paystack_reference=reference).first()
                    
                    if payment:
                        payment.status = 'success'
                        payment.response_data = payload
                        payment.save()
                        
                        # Generate receipt if payment is successful
                        from receipts.models import Receipt
                        receipt_exists = Receipt.objects.filter(payment=payment).exists()
                        if not receipt_exists:
                            from receipts.services import ReceiptGenerator
                            ReceiptGenerator.generate_receipt(payment)
                
                elif event == 'charge.failed':
                    reference = payload['data']['reference']
                    payment = Payment.objects.filter(paystack_reference=reference).first()
                    
                    if payment:
                        payment.status = 'failed'
                        payment.response_data = payload
                        payment.save()
        
        return HttpResponse(status=200)
    
    return HttpResponse(status=400)

# Analytics views
from .analytics import PaymentAnalytics

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_summary(request):
    """Get daily payment summary"""
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    summary = PaymentAnalytics.get_daily_summary(start_date, end_date)
    return Response(summary)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_summary(request):
    """Get payment summary by user"""
    user_type = request.GET.get('user_type')
    summary = PaymentAnalytics.get_user_summary(user_type)
    return Response(summary)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overall_stats(request):
    """Get overall payment statistics"""
    stats = PaymentAnalytics.get_overall_stats()
    return Response(stats)