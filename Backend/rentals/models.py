# rentals/models.py
import builtins
from io import BytesIO
from pathlib import Path

from django.db import models
from django.conf import settings
from django.core.files.base import ContentFile

from PIL import Image, ImageOps

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
    google_maps_url = models.URLField(blank=True, null=True)
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
    thumbnail = models.ImageField(upload_to='property_thumbnails/', blank=True, null=True)
    media_file = models.FileField(upload_to='property_media/', blank=True, null=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='IMAGE')
    created_at = models.DateTimeField(auto_now_add=True)

    def _has_new_image(self):
        if not self.image:
            return False
        if not self.pk:
            return True
        old_image_name = (
            PropertyImage.objects
            .filter(pk=self.pk)
            .values_list('image', flat=True)
            .first()
        )
        return (old_image_name or '') != (self.image.name or '')

    def _build_webp_file(self, image_obj, size, quality):
        if image_obj.mode != 'RGB':
            image_obj = image_obj.convert('RGB')

        processed = image_obj.copy()
        if size == (300, 200):
            processed = ImageOps.fit(processed, size, method=Image.Resampling.LANCZOS)
        else:
            processed.thumbnail(size, Image.Resampling.LANCZOS)

        output = BytesIO()
        processed.save(output, format='WEBP', quality=quality, optimize=True)
        return ContentFile(output.getvalue())

    def _process_uploaded_image(self):
        img = Image.open(self.image)
        base_name = Path(self.image.name).stem or 'property_image'

        full_file = self._build_webp_file(img, (1200, 1200), quality=75)
        thumb_file = self._build_webp_file(img, (300, 200), quality=65)

        self.image.save(f'{base_name}.webp', full_file, save=False)
        self.thumbnail.save(f'{base_name}_thumb.webp', thumb_file, save=False)

    def save(self, *args, **kwargs):
        should_process_image = (
            self.media_type == 'IMAGE'
            and self.image
            and (
                self._has_new_image()
                or not self.thumbnail
                or not (self.image.name or '').lower().endswith('.webp')
            )
        )

        if should_process_image:
            self._process_uploaded_image()

        if self.media_type == 'VIDEO' and self.thumbnail:
            self.thumbnail.delete(save=False)
            self.thumbnail = None

        super().save(*args, **kwargs)

    @builtins.property
    def file_url(self):
        if self.media_file:
            return self.media_file.url
        if self.image:
            return self.image.url
        return ''

    @builtins.property
    def full_url(self):
        return self.file_url

    @builtins.property
    def thumbnail_url(self):
        if self.media_type == 'VIDEO':
            return self.file_url
        if self.thumbnail:
            return self.thumbnail.url
        if self.image:
            return self.image.url
        return ''

    def __str__(self):
        return f"{self.media_type} for {self.property.title}"