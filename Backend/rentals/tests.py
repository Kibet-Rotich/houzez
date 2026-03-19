from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Property

User = get_user_model()


class PropertyApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username='owner1',
            email='owner1@example.com',
            password='testpass123',
            role='OWNER',
            phone_number='0700000001',
        )
        self.customer = User.objects.create_user(
            username='customer1',
            email='customer1@example.com',
            password='testpass123',
            role='CUSTOMER',
        )

        Property.objects.create(
            owner=self.owner,
            title='Juja Bedsitter Alpha',
            description='Near JKUAT gate C',
            location='Juja',
            price=12000,
            property_type='BEDSITTER',
            available_units=2,
        )
        Property.objects.create(
            owner=self.owner,
            title='Kasarani One Bedroom',
            description='Quiet court near stage',
            location='Kasarani',
            price=22000,
            property_type='1_BDRM',
            available_units=0,
        )

    def test_search_and_price_range_filters(self):
        response = self.client.get('/api/properties/', {'search': 'juja', 'min_price': 10000, 'max_price': 15000})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data)  # type: ignore[attr-defined]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], 'Juja Bedsitter Alpha')

    def test_min_units_filter(self):
        response = self.client.get('/api/properties/', {'min_units': 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data)  # type: ignore[attr-defined]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['available_units'], 2)

    def test_customer_cannot_create_property_listing(self):
        self.client.force_authenticate(user=self.customer)  # type: ignore[attr-defined]
        response = self.client.post(
            '/api/properties/',
            {
                'title': 'Blocked Listing',
                'description': 'Should fail',
                'location': 'Nairobi',
                'price': '18000.00',
                'property_type': 'BEDSITTER',
                'available_units': 1,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
