from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    # What columns to show in the list view
    list_display = ['username', 'email', 'role', 'is_staff']
    
    # Add our custom fields to the admin editing screen
    fieldsets = UserAdmin.fieldsets + (
        ('Platform Details', {'fields': ('role', 'phone_number')}),
    ) # type: ignore

admin.site.register(User, CustomUserAdmin)