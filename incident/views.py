from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.core import serializers
from .forms import IncidentForm, UpdateForm, DeveloperForm
from .models import Incident,Developers

# Create your views here.

def indexView(request):
    form = IncidentForm()
    update_form = UpdateForm()
    developer_form = DeveloperForm()

    incidents = Incident.objects.all()
    developers = []
    dev_info = Developers.objects.all()
    for i in incidents:
        developers += [i.developer.all()]
    zip_incident = zip(incidents,developers)
    return render(request, 'index.html', {"form": form, "incident": zip_incident, "update_form":update_form, "dev_info":dev_info, "developer_form": developer_form})

def postIncident(request):
    if request.is_ajax and request.method == "POST":
        form = IncidentForm(request.POST)

        if form.is_valid():
            instance = form.save()
            dev_data = instance.developer.all()

            
            ser_instance = serializers.serialize('json',[instance,])
            ser_dev = serializers.serialize('json', dev_data)

            return JsonResponse({"instance": ser_instance, 'dev_instance':ser_dev},status=200)
        else:
            return JsonResponse({"error": form.errors},status=400)
    
    return JsonResponse({"error":"error"},status=400)

def checkName(request):
    if request.is_ajax and request.method=="GET":
        company_name = request.GET.get("company_name",None)
        if Incident.objects.filter(company_name=company_name).exists():
            return JsonResponse({"valid":False},status = 200)
        else:
            return JsonResponse({"valid":True},status = 200)

    return JsonResponse({},status = 400)


def delete_post(request, test_id):
    remv_post = Incident.objects.get(id = test_id)
    if request.method=='DELETE':
        remv_post.delete()
        return JsonResponse({
            'valid':True
        })
    return HttpResponseBadRequest('invalid')

def update_post(request, test_id):
    if request.method == "PUT":
        
        all_data = request.body.decode('utf-8').split('&')
        dev_team = list(filter(None,all_data[3].split('=')[1].split('+')))
        spc_name = all_data[1].split('=')[1].split('+')
        spc_comp = all_data[0].split('=')[1].split('+')

        #allows to add names with spaces
        str_spc_name = ''
        str_comp_name = ''

        for val in spc_name:
            str_spc_name += val + ' '

        for dal in spc_comp:
            str_comp_name += dal + ' '   

        clean_data = {
            'company_name': str_comp_name,
            'first_name': str_spc_name,
            'last_name': all_data[2].split('=')[1],
        }
        

        form = UpdateForm(clean_data)    

        if form.is_valid():
            

            obj, was_created = Incident.objects.update_or_create(id = test_id, defaults = clean_data)
            obj.developer.clear()


            if obj != None:
                for i in dev_team:
                    dev_obj = Developers.objects.get(id = i)
                    obj.developer.add(dev_obj)
                
                obj.save()
                dev_data = obj.developer.all()
                ser_dev = serializers.serialize('json', dev_data)
                ser_instance =  serializers.serialize('json',[obj])

                return JsonResponse({"instance": ser_instance, 'dev_instance':ser_dev},status=200)

        else:
            return JsonResponse({"error": form.errors},status=400)
   
    else:
        return JsonResponse({"error":"error"},status=400)


#Requests for the developer model starts here

def create_developer(request):
    if request.is_ajax and request.method == "POST":
        form = DeveloperForm(request.POST)

        if form.is_valid():
            id_list = request.POST.getlist('incidents')

            instance = form.save()
            
            for id in id_list:
                vari = Incident.objects.get(id = id)
                instance.developer_teams.add(vari)
            instance.save()
            
            print(instance.developer_teams.all())
            ser_instance = serializers.serialize('json',[instance,])

            return JsonResponse({"instance": ser_instance},status=200)
        else:
            return JsonResponse({"error": form.errors},status=400)
    
    return JsonResponse({"error":"error"},status=400)


def delete_developer(request, test_id):
    remv_dev = Developers.objects.get(id = test_id)
    if request.method=='DELETE':
        remv_dev.delete()
        return JsonResponse({
            'valid':True
        })
    return HttpResponseBadRequest('invalid')

def checkTeamName(request):
    if request.is_ajax and request.method=="GET":
        team_name = request.GET.get("team_name",None)
        if Developers.objects.filter(team_name=team_name).exists():
            return JsonResponse({"valid":False},status = 200)
        else:
            return JsonResponse({"valid":True},status = 200)

    return JsonResponse({},status = 400)

def update_developer(request, test_id):
    if request.method == "PUT":
        
        all_data = request.body.decode('utf-8').split('&')
        spc_name = all_data[0].split('=')[1].split('+')[0]
        spc_email = all_data[1].split('=')[1].split('%40')

        #allows to add names with spaces
        str_spc_email = spc_email[0]+'@'+spc_email[1]
        clean_data = {
            'team_name': spc_name,
            'team_email': str_spc_email,
            'team_number': all_data[2].split('=')[1],
        }
        

        form = DeveloperForm(clean_data)    

        if form.is_valid():
            obj, was_created = Developers.objects.update_or_create(id = test_id, defaults = clean_data)
            if obj != None:
                obj.save()
                ser_instance =  serializers.serialize('json',[obj])
                return JsonResponse({"dev_instance": ser_instance,},status=200)
        else:
            return JsonResponse({"error": form.errors},status=400)
   
    else:
        return JsonResponse({"error":"error"},status=400)