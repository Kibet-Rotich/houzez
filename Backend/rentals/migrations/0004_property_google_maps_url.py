from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rentals', '0003_property_available_units_propertyimage_media_updates'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='google_maps_url',
            field=models.URLField(blank=True, null=True),
        ),
    ]
