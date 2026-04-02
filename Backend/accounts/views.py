import logging

from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()
logger = logging.getLogger('accounts')

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,) # Anyone can register
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        username = request.data.get('username', '')
        email = request.data.get('email', '')
        role = request.data.get('role', '')
        logger.info('Registration attempt username=%s email=%s role=%s', username, email, role)

        response = super().create(request, *args, **kwargs)

        if response.status_code >= 400:
            logger.warning(
                'Registration failed username=%s email=%s status=%s errors=%s',
                username,
                email,
                response.status_code,
                response.data,
            )
        else:
            logger.info('Registration success username=%s email=%s status=%s', username, email, response.status_code)

        return response


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    # Tell the view to use our customized serializer
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '')
        logger.info('Login attempt username=%s', username)
        response = super().post(request, *args, **kwargs)

        if response.status_code >= 400:
            logger.warning('Login failed username=%s status=%s', username, response.status_code)
        else:
            logger.info('Login success username=%s status=%s', username, response.status_code)

        return response