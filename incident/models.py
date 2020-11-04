from django.db import models

class Developers(models.Model):
    team_name = models.CharField(max_length=100)
    team_email = models.EmailField(max_length=254)
    team_number = models.IntegerField()


    def __str__(self):
        return self.team_name

class Incident(models.Model):
    company_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    issue_time = models.DateField(auto_now=False, auto_now_add = False)
    developer = models.ManyToManyField(Developers, related_name='developer_teams')

    def __str__(self):
        return self.first_name


