from .models import Incident, Developers
from django import forms
import datetime

class IncidentForm(forms.ModelForm):
    issue_time = forms.DateField(label='When did you face the issue?',widget=forms.SelectDateWidget(years=range(2020,datetime.date.today().year)))
    developer = forms.ModelMultipleChoiceField(queryset = Developers.objects.all(), required = True)

    def __init__(self,*args, **kwargs):
        super(IncidentForm, self).__init__(*args,**kwargs)

        for name in self.fields.keys():
            self.fields[name].widget.attrs.update({
                'class': 'form-control',
            })
   
    class Meta:
        model = Incident
        fields = ("__all__")


class UpdateForm(forms.ModelForm):
    
    developer = forms.ModelMultipleChoiceField(queryset = Developers.objects.all(), required = False)
    def __init__(self,*args, **kwargs):
        super(UpdateForm, self).__init__(*args,**kwargs)

        for name in self.fields.keys():
            self.fields[name].widget.attrs.update({
                'class': 'form-control',
            })
  
    class Meta:
        model = Incident
        fields = ('company_name', 'first_name', 'last_name', 'developer')

class DeveloperForm(forms.ModelForm):
    
    incidents = forms.ModelMultipleChoiceField(queryset = Incident.objects.all(), required = False)
    def __init__(self,*args, **kwargs):
        super(DeveloperForm, self).__init__(*args,**kwargs)

        for name in self.fields.keys():
            self.fields[name].widget.attrs.update({
            'class': 'form-control',
            })

    
    class Meta:
        model = Developers
        fields = ("__all__")