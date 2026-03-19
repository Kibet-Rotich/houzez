# rentals/models.py
import builtins

from django.db import models
from django.conf import settings

class Property(models.Model):
    PROPERTY_TYPES = (
        ('BEDSITTER', 'Bedsitter'),
        ('1_BDRM', '1 Bedroom'),
        ('2_BDRM', '2 Bedroom'),
        ('HOUSE', 'Full House'),
    )

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    available_units = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.location}"

    @property
    def is_available(self):
        return self.available_units > 0

class Booking(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    )

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='bookings')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    scheduled_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking by {self.customer.username} for {self.property.title}"
    

class PropertyImage(models.Model):
    MEDIA_TYPE_CHOICES = (
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video'),
    )

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='property_images/', blank=True, null=True)
    media_file = models.FileField(upload_to='property_media/', blank=True, null=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='IMAGE')
    created_at = models.DateTimeField(auto_now_add=True)

    @builtins.property
    def file_url(self):
        if self.media_file:
            return self.media_file.url
        if self.image:
            return self.image.url
        return ''

    def __str__(self):
        return f"{self.media_type} for {self.property.title}"