from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from rentals.models import Property

User = get_user_model()


class StaffPortalTests(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user(
            username='staff1',
            email='staff1@example.com',
            password='testpass123',
            role='OWNER',
            is_staff=True,
        )
        self.customer = User.objects.create_user(
            username='customer1',
            email='customer1@example.com',
            password='testpass123',
            role='CUSTOMER',
        )
        self.owner = User.objects.create_user(
            username='owner1',
            email='owner1@example.com',
            password='testpass123',
            role='OWNER',
        )

        self.property = Property.objects.create(
            owner=self.owner,
            title='Test Listing',
            description='Test description',
            location='Juja',
            google_maps_url='https://maps.google.com/?q=-1.0,37.0',
            price=10000,
            property_type='BEDSITTER',
            available_units=1,
        )

    def test_staff_can_access_portal(self):
        self.client.force_authenticate(user=self.staff)  # type: ignore[attr-defined]
        response = self.client.get('/api/staff-portal/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('stats', response.data)
        self.assertIn('recent_properties', response.data)

    def test_non_staff_cannot_access_portal(self):
        self.client.force_authenticate(user=self.customer)  # type: ignore[attr-defined]
        response = self.client.get('/api/staff-portal/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_can_delete_any_property(self):
        self.client.force_authenticate(user=self.staff)  # type: ignore[attr-defined]
        response = self.client.delete(f'/api/properties/{self.property.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Property.objects.filter(id=self.property.id).exists())


class StaffUserManagementTests(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user(
            username='staff1',
            email='staff1@example.com',
            password='testpass123',
            role='OWNER',
            is_staff=True,
        )
        self.customer = User.objects.create_user(
            username='customer1',
            email='customer1@example.com',
            password='testpass123',
            role='CUSTOMER',
        )

    def test_staff_can_list_users(self):
        self.client.force_authenticate(user=self.staff)  # type: ignore[attr-defined]
        response = self.client.get('/api/staff-users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    def test_staff_can_update_permissions(self):
        self.client.force_authenticate(user=self.staff)  # type: ignore[attr-defined]
        response = self.client.patch(
            f'/api/staff-users/{self.customer.id}/',
            {'is_staff': True, 'role': 'OWNER'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertTrue(self.customer.is_staff)
        self.assertEqual(self.customer.role, 'OWNER')

    def test_staff_cannot_delete_self(self):
        self.client.force_authenticate(user=self.staff)  # type: ignore[attr-defined]
        response = self.client.delete(f'/api/staff-users/{self.staff.id}/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)