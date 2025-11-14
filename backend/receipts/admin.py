from django.contrib import admin
from .models import Receipt

@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'payment', 'staff_member', 'generated_at')
    list_filter = ('generated_at', 'staff_member')
    search_fields = ('receipt_number', 'payment__reference_id')
    readonly_fields = ('receipt_number', 'generated_at', 'receipt_data')
    date_hierarchy = 'generated_at'
    
    def payment_reference(self, obj):
        return obj.payment.reference_id
    payment_reference.short_description = 'Payment Reference'