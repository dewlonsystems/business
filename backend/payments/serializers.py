from rest_framework import serializers
from .models import Payment
from accounts.serializers import UserSerializer

class PaymentSerializer(serializers.ModelSerializer):
    initiated_by = UserSerializer(read_only=True)
    # URL to redirect user to Paystack checkout
    authorization_url = serializers.CharField(read_only=True, required=False)

    class Meta:
        model = Payment
        # keep all fields as before
        fields = '__all__'
        read_only_fields = (
            'reference_id', 'status', 'initiated_by',
            'created_at', 'updated_at', 'paystack_reference',
            'response_data', 'authorization_url'
        )

    def create(self, validated_data):
        """
        Assign the logged-in user as initiator and create Payment instance
        """
        user = self.context['request'].user
        validated_data['initiated_by'] = user
        return super().create(validated_data)
