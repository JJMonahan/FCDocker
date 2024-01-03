# Generated by Django 4.2.6 on 2023-11-06 03:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('fcapi', '0002_alter_contact_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roleassoc',
            name='role',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='fcapi.role'),
        ),
        migrations.AlterField(
            model_name='roleassoc',
            name='source',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='fcapi.contact'),
        ),
    ]