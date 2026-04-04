from django.urls import path

from .views import StaffPortalView


urlpatterns = [
    path('staff-portal/', StaffPortalView.as_view(), name='staff-portal'),
]