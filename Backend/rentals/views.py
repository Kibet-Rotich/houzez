import logging

from django_filters import rest_framework as django_filters
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property, Booking
from .serializers import PropertySerializer, BookingSerializer


logger = logging.getLogger('rentals')


class IsOwnerWriteOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            logger.warning('Permission denied: unauthenticated write attempt method=%s path=%s', request.method, request.path)
            return False
        is_owner = getattr(request.user, 'role', '') == 'OWNER'
        is_staff = bool(getattr(request.user, 'is_staff', False))
        if not (is_owner or is_staff):
            logger.warning(
                'Permission denied: non-owner write attempt user_id=%s role=%s is_staff=%s method=%s path=%s',
                request.user.id,
                getattr(request.user, 'role', ''),
                getattr(request.user, 'is_staff', False),
                request.method,
                request.path,
            )
        return is_owner or is_staff

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user and request.user.is_authenticated and getattr(request.user, 'is_staff', False):
            return True
        allowed = bool(request.user and request.user.is_authenticated and obj.owner_id == request.user.id)
        if not allowed:
            logger.warning(
                'Permission denied: owner mismatch user_id=%s owner_id=%s method=%s path=%s',
                getattr(request.user, 'id', 'anonymous'),
                obj.owner_id,
                request.method,
                request.path,
            )
        return allowed


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
        property_obj = serializer.save(owner=self.request.user)
        logger.info(
            'Property created property_id=%s owner_id=%s title=%s',
            property_obj.id,
            self.request.user.id,
            property_obj.title,
        )

    def perform_update(self, serializer):
        property_obj = serializer.save()
        logger.info(
            'Property updated property_id=%s owner_id=%s title=%s',
            property_obj.id,
            self.request.user.id,
            property_obj.title,
        )

    def perform_destroy(self, instance):
        property_id = instance.id
        owner_id = instance.owner_id
        title = instance.title
        super().perform_destroy(instance)
        logger.info(
            'Property deleted property_id=%s owner_id=%s title=%s',
            property_id,
            owner_id,
            title,
        )


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
            queryset = Booking.objects.filter(property__owner=user)
            logger.info('Owner booking query user_id=%s', user.id)
            return queryset
        queryset = Booking.objects.filter(customer=user)
        logger.info('Customer booking query user_id=%s', user.id)
        return queryset

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the customer making the booking
        booking = serializer.save(customer=self.request.user)
        logger.info(
            'Booking created booking_id=%s property_id=%s customer_id=%s scheduled_date=%s',
            booking.id,
            booking.property_id,
            booking.customer_id,
            booking.scheduled_date,
        )

    def perform_update(self, serializer):
        booking = serializer.save()
        logger.info(
            'Booking updated booking_id=%s property_id=%s customer_id=%s status=%s',
            booking.id,
            booking.property_id,
            booking.customer_id,
            booking.status,
        )