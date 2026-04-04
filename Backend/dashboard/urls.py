from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import StaffPortalView, StaffUserViewSet


router = DefaultRouter()
router.register(r'staff-users', StaffUserViewSet, basename='staff-user')


urlpatterns = [
    path('staff-portal/', StaffPortalView.as_view(), name='staff-portal'),
    path('', include(router.urls)),
]