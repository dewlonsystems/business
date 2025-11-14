from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('reference_id', 'phone_number', 'amount', 'status', 'payment_method', 'initiated_by', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at', 'initiated_by')
    search_fields = ('reference_id', 'phone_number', 'mpesa_transaction_id', 'paystack_reference')
    readonly_fields = ('reference_id', 'mpesa_transaction_id', 'paystack_reference', 'response_data', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    def get_readonly_fields(self, request, obj=None):
        # Make reference_id readonly only when editing existing object
        if obj:  # Editing an existing object
            return self.readonly_fields
        # When creating a new object, allow reference_id to be set automatically
        return [f for f in self.readonly_fields if f != 'reference_id']