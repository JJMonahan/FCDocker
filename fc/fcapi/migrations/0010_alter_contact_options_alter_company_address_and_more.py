# Generated by Django 4.2.7 on 2023-11-07 20:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fcapi', '0009_job_company'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='contact',
            options={'ordering': ['lname', 'fname']},
        ),
        migrations.AlterField(
            model_name='company',
            name='address',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='company',
            name='description',
            field=models.TextField(blank=True, max_length=25, null=True),
        ),
        migrations.AlterField(
            model_name='company',
            name='mapurl',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='company',
            name='url',
            field=models.TextField(blank=True, null=True),
        ),
    ]
