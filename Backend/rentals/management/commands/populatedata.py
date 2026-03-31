import csv
import requests
from urllib.parse import urlparse
from decimal import Decimal
import os

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from rentals.models import Property, PropertyImage

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate the database with properties from jiji_test_houses.csv and download images.'

    def handle(self, *args, **kwargs):
        csv_filepath = 'jiji_test_houses.csv'

        if not os.path.exists(csv_filepath):
            self.stdout.write(self.style.ERROR(f"CSV file not found at: {csv_filepath}"))
            return

        # 1. Ensure we have a default user to own these properties
        owner, created = User.objects.get_or_create(
            username='jiji_scraper_bot',
            defaults={'email': 'scraper@example.com'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created default user: {owner.username}"))

        # 2. Open and read the CSV
        with open(csv_filepath, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            count = 0

            for row in reader:
                title = row.get('House Type', '')
                location = row.get('Location', '')
                price_str = row.get('Price Numeric', '0')
                description = row.get('Short Description', 'No description available.')
                image_url = row.get('Image URL', '')

                # Skip if essential data is missing
                if not title or not price_str:
                    continue

                # Safely convert price
                try:
                    price = Decimal(price_str)
                except Exception:
                    price = Decimal('0.00')

                # Determine property type based on title keywords
                title_lower = title.lower()
                if 'bedsitter' in title_lower:
                    prop_type = 'BEDSITTER'
                elif '1bdrm' in title_lower or '1 bedroom' in title_lower:
                    prop_type = '1_BDRM'
                elif '2bdrm' in title_lower or '2 bedroom' in title_lower:
                    prop_type = '2_BDRM'
                else:
                    prop_type = 'HOUSE' # Default for 3bdrm, 4bdrm, bungalows, etc.

                # 3. Create the Property instance
                property_instance = Property.objects.create(
                    owner=owner,
                    title=title,
                    description=description,
                    location=location,
                    price=price,
                    property_type=prop_type,
                    available_units=1
                )

                # 4. Download and save the image as a physical file
                if image_url:
                    self.stdout.write(f"Downloading image for: {title[:30]}...")
                    try:
                        response = requests.get(image_url, timeout=10)
                        if response.status_code == 200:
                            # Extract a clean filename from the URL
                            file_name = os.path.basename(urlparse(image_url).path)
                            if not file_name:
                                file_name = f"property_{property_instance.id}.webp"

                            # Create the PropertyImage instance
                            prop_image = PropertyImage(
                                property=property_instance,
                                media_type='IMAGE'
                            )
                            
                            # Save the downloaded binary content into the ImageField
                            prop_image.image.save(
                                file_name, 
                                ContentFile(response.content), 
                                save=True
                            )
                        else:
                            self.stdout.write(self.style.WARNING(f"Failed to download image (Status: {response.status_code})"))
                    except requests.RequestException as e:
                        self.stdout.write(self.style.WARNING(f"Error downloading image: {e}"))

                count += 1
                self.stdout.write(self.style.SUCCESS(f"Saved: {title}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} properties!"))