from django_filters import rest_framework as django_filters
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property, Booking
from .serializers import PropertySerializer, BookingSerializer


class IsOwnerWriteOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', '') == 'OWNER'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and obj.owner_id == request.user.id)


class PropertyFilterSet(django_filters.FilterSet):
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_units = django_filters.NumberFilter(field_name='available_units', lookup_expr='gte')
    max_units = django_filters.NumberFilter(field_name='available_units', lookup_expr='lte')

    class Meta:
        model = Property
        fields = ['location', 'property_type', 'available_units', 'min_price', 'max_price', 'min_units', 'max_units']


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.select_related('owner').prefetch_related('images').all()
    serializer_class = PropertySerializer
    permission_classes = [IsOwnerWriteOrReadOnly]
    
    # Setup filtering and searching
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = PropertyFilterSet
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