from django.contrib.auth import get_user_model
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from rentals.models import Booking, Property
from rentals.serializers import PropertySerializer

from .serializers import StaffUserSerializer
from .permissions import IsStaffMember


User = get_user_model()


class StaffPortalView(APIView):
    permission_classes = [IsAuthenticated, IsStaffMember]

    def get(self, request):
        properties = Property.objects.select_related('owner').prefetch_related('images').order_by('-created_at')
        recent_properties = PropertySerializer(properties[:12], many=True).data

        stats = {
            'total_properties': Property.objects.count(),
            'available_properties': Property.objects.filter(available_units__gt=0).count(),
            'total_bookings': Booking.objects.count(),
            'pending_bookings': Booking.objects.filter(status='PENDING').count(),
            'owners_with_listings': Property.objects.values('owner').distinct().count(),
        }

        return Response({
            'stats': stats,
            'recent_properties': recent_properties,
        })


class StaffUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStaffMember]
    serializer_class = StaffUserSerializer
    queryset = User.objects.all().order_by('-date_joined')

    def perform_destroy(self, instance):
        if self.request.user.id == instance.id:
            raise ValidationError('You cannot delete your own staff account while signed in.')
        instance.delete()