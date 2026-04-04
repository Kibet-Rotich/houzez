from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rentals.models import Booking, Property
from rentals.serializers import PropertySerializer

from .permissions import IsStaffMember


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