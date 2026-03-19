from django.contrib import admin
from .models import Property, Booking, PropertyImage

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'location', 'price', 'property_type', 'available_units')
    list_filter = ('property_type', 'location')
    search_fields = ('title', 'location', 'description')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('property', 'customer', 'scheduled_date', 'status')
    list_filter = ('status', 'scheduled_date')
    search_fields = ('customer__username', 'property__title')


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'media_type', 'created_at')
    list_filter = ('media_type',)
    search_fields = ('property__title',)