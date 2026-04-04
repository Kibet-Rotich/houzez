# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone_number')
        # Ensure the password is only used for writing (creation/updating) and never read
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Use create_user to properly hash the password before saving
        user = User.objects.create_user(**validated_data)
        return user


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# accounts/serializers.py

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims into the ENCRYPTED payload
        token['username'] = user.username
        token['role'] = user.role
        token['email'] = user.email
        token['is_staff'] = user.is_staff

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Keep these for easy access on the frontend without decoding
        data['role'] = self.user.role # type: ignore
        data['username'] = self.user.username # type: ignore
        data['is_staff'] = self.user.is_staff # type: ignore
        return data