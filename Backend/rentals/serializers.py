# rentals/serializers.py
import os
from urllib.parse import quote_plus

from rest_framework import serializers

from .models import Property, Booking, PropertyImage


class PropertyMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    # Keep `image` key for backward compatibility with existing frontend components.
    image = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'media_type', 'url', 'image', 'created_at']

    def get_url(self, obj):
        return obj.file_url

    def get_image(self, obj):
        return obj.file_url


class PropertySerializer(serializers.ModelSerializer):
    images = PropertyMediaSerializer(many=True, read_only=True)
    media = PropertyMediaSerializer(source='images', many=True, read_only=True)
    owner_name = serializers.ReadOnlyField(source='owner.username')
    owner_email = serializers.ReadOnlyField(source='owner.email')
    owner_phone_number = serializers.ReadOnlyField(source='owner.phone_number')
    owner_first_name = serializers.ReadOnlyField(source='owner.first_name')
    owner_last_name = serializers.ReadOnlyField(source='owner.last_name')
    is_available = serializers.SerializerMethodField()
    directions_url = serializers.SerializerMethodField()

    uploaded_media = serializers.ListField(
        child=serializers.FileField(max_length=10000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False,
        allow_empty=True,
    )
    # Keep legacy key accepted for older clients.
    uploaded_images = serializers.ListField(
        child=serializers.FileField(max_length=10000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False,
        allow_empty=True,
    )
    replace_media = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ('owner',)

    def get_is_available(self, obj):
        return obj.available_units > 0

    def get_directions_url(self, obj):
        if obj.google_maps_url:
            return obj.google_maps_url

        if not obj.location:
            return ''

        query = quote_plus(obj.location)
        return f'https://www.google.com/maps/search/?api=1&query={query}'

    def validate(self, attrs):
        media_files = attrs.get('uploaded_media', [])
        legacy_files = attrs.get('uploaded_images', [])
        all_files = [*media_files, *legacy_files]
        existing_items = 0

        if self.instance:
            replace_media = attrs.get('replace_media', False)
            existing_items = 0 if replace_media else self.instance.images.count()

        if existing_items + len(all_files) > 15:
            raise serializers.ValidationError('You can upload up to 15 media files per property.')

        for upload in all_files:
            self._detect_media_type(upload)

        return attrs

    def _detect_media_type(self, upload):
        content_type = getattr(upload, 'content_type', '') or ''
        ext = os.path.splitext(upload.name)[1].lower()

        if content_type.startswith('image/') or ext in {'.jpg', '.jpeg', '.png', '.webp', '.gif'}:
            return 'IMAGE'
        if content_type.startswith('video/') or ext in {'.mp4', '.mov', '.avi', '.mkv', '.webm'}:
            return 'VIDEO'
        raise serializers.ValidationError(f'Unsupported media type for file: {upload.name}')

    def _save_media(self, property_obj, uploads):
        for upload in uploads:
            media_type = self._detect_media_type(upload)
            if media_type == 'IMAGE':
                PropertyImage.objects.create(property=property_obj, image=upload, media_type='IMAGE')
            else:
                PropertyImage.objects.create(property=property_obj, media_file=upload, media_type='VIDEO')

    def create(self, validated_data):
        uploads = [
            *validated_data.pop('uploaded_media', []),
            *validated_data.pop('uploaded_images', []),
        ]
        validated_data.pop('replace_media', None)

        property_obj = Property.objects.create(**validated_data)
        self._save_media(property_obj, uploads)
        return property_obj

    def update(self, instance, validated_data):
        uploads = [
            *validated_data.pop('uploaded_media', []),
            *validated_data.pop('uploaded_images', []),
        ]
        replace_media = validated_data.pop('replace_media', False)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if replace_media:
            instance.images.all().delete()

        self._save_media(instance, uploads)
        return instance


class BookingSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.username')
    property_title = serializers.ReadOnlyField(source='property.title')

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('customer', 'created_at')

    def validate_property(self, value):
        if value.available_units <= 0:
            raise serializers.ValidationError('This listing currently has no available units.')
        return value