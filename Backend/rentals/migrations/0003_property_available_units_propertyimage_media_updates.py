import django.utils.timezone
from django.db import migrations, models


def copy_is_available_to_units(apps, schema_editor):
    Property = apps.get_model('rentals', 'Property')
    for property_obj in Property.objects.all():
        property_obj.available_units = 1 if property_obj.is_available else 0
        property_obj.save(update_fields=['available_units'])


def noop_reverse(apps, schema_editor):
    return


class Migration(migrations.Migration):

    dependencies = [
        ('rentals', '0002_propertyimage'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='available_units',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.RunPython(copy_is_available_to_units, noop_reverse),
        migrations.RemoveField(
            model_name='property',
            name='is_available',
        ),
        migrations.AddField(
            model_name='propertyimage',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='propertyimage',
            name='media_file',
            field=models.FileField(blank=True, null=True, upload_to='property_media/'),
        ),
        migrations.AddField(
            model_name='propertyimage',
            name='media_type',
            field=models.CharField(
                choices=[('IMAGE', 'Image'), ('VIDEO', 'Video')],
                default='IMAGE',
                max_length=10,
            ),
        ),
        migrations.AlterField(
            model_name='propertyimage',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='property_images/'),
        ),
    ]
