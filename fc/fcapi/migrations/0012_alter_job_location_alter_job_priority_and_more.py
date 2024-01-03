# Generated by Django 4.2.7 on 2023-11-27 19:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fcapi', '0011_job_location_job_priority_job_status_job_travel'),
    ]

    operations = [
        migrations.AlterField(
            model_name='job',
            name='location',
            field=models.CharField(choices=[('Unknown', 'Unknown'), ('Office', 'Office'), ('Hybrid', 'Hybrid'), ('Remote', 'Remote')], default='Unknown', max_length=50),
        ),
        migrations.AlterField(
            model_name='job',
            name='priority',
            field=models.CharField(choices=[('Unknown', 'Unknown'), ('Low', 'Low'), ('Medium', 'Medium'), ('Hight', 'High'), ('Critical', 'Critical')], default='Unknown', max_length=50),
        ),
        migrations.AlterField(
            model_name='job',
            name='status',
            field=models.CharField(choices=[('Interested', 'Expressed Interest'), ('Applied', 'Applied'), ('Interviewing', 'Interviewing'), ('Pending Offer', 'Pending Offer'), ('Rejection', 'Rejection Received'), ('Withdrawn', 'Withdrawn')], default='Unknown', max_length=50),
        ),
        migrations.AlterField(
            model_name='job',
            name='travel',
            field=models.CharField(choices=[('Unknown', 'Unknown'), ('None', 'None'), ('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')], default='Unknown', max_length=50),
        ),
    ]