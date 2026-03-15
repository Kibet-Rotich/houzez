from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property, Booking
from .serializers import PropertySerializer, BookingSerializer

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    # Unauthenticated users can read (GET), but only authenticated users can write (POST/PUT/DELETE)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 
    
    # Setup filtering and searching
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['location', 'property_type', 'is_available']
    search_fields = ['title', 'location', 'description']

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner of the property
        serializer.save(owner=self.request.user)


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated] # Must be logged in to book

    def get_queryset(self):
        """
        Custom logic: 
        - Owners see bookings for their properties.
        - Customers see bookings they have made.
        """
        user = self.request.user
        if getattr(user, 'role', '') == 'OWNER':
            return Booking.objects.filter(property__owner=user)
        return Booking.objects.filter(customer=user)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the customer making the booking
        serializer.save(customer=self.request.user)