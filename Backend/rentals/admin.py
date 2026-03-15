from django.contrib import admin
from .models import Property, Booking

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'location', 'price', 'property_type', 'is_available')
    list_filter = ('is_available', 'property_type', 'location')
    search_fields = ('title', 'location', 'description')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('property', 'customer', 'scheduled_date', 'status')
    list_filter = ('status', 'scheduled_date')
    search_fields = ('customer__username', 'property__title')