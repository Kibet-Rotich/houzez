from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rentals', '0004_property_google_maps_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='propertyimage',
            name='thumbnail',
            field=models.ImageField(blank=True, null=True, upload_to='property_thumbnails/'),
        ),
    ]
