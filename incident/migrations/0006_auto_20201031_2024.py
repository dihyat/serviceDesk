# Generated by Django 3.1.1 on 2020-10-31 20:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('incident', '0005_auto_20201028_2223'),
    ]

    operations = [
        migrations.AlterField(
            model_name='incident',
            name='developer',
            field=models.ManyToManyField(related_name='developer_teams', to='incident.Developers'),
        ),
    ]