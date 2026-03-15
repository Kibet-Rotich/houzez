# rentals/serializers.py
from rest_framework import serializers
from .models import Property, Booking, PropertyImage

# rentals/serializers.py
class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image']

class PropertySerializer(serializers.ModelSerializer):
    # This lists the images inside the property object
    images = PropertyImageSerializer(many=True, read_only=True)

    owner_name = serializers.ReadOnlyField(source='owner.username')
    
    # We add this to handle the upload logic for multiple files
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )

    class Meta:
        model = Property
        fields = '__all__' # Now includes 'images' and 'uploaded_images'
        read_only_fields = ('owner',)

    def create(self, validated_data):
        # Extract the images before creating the property
        uploaded_images = validated_data.pop('uploaded_images', [])
        property = Property.objects.create(**validated_data)
        
        # Save each image
        for image in uploaded_images:
            PropertyImage.objects.create(property=property, image=image)
        return property
    


class BookingSerializer(serializers.ModelSerializer):
    # Adding helpful string representations for the frontend
    customer_name = serializers.ReadOnlyField(source='customer.username')
    property_title = serializers.ReadOnlyField(source='property.title')

    class Meta:
        model = Booking
        fields = '__all__'
        # The customer is automatically set to the logged-in user making the request
        read_only_fields = ('customer', 'created_at')