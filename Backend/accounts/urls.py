from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import RegisterView, CustomTokenObtainPairView

urlpatterns = [
    # Registration endpoint (Anyone can register)
    path('register/', RegisterView.as_view(), name='auth_register'),
    
    # JWT Login endpoint (Returns Access & Refresh tokens)
   path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # JWT Refresh endpoint (Use this to get a new access token when the old one expires)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]