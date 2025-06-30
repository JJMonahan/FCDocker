from django.apps import apps
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Contact, Note, Role, Company, Job, Log
from django.shortcuts import get_object_or_404
from .serializers import (
    ContactSerializer,
    NoteSerializer,
    RoleSerializer,
    CompanySerializer,
    JobSerializer,
    LogSerializer,
)
from rest_framework.views import APIView
from rest_framework import status as drf_status

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().order_by('lname','fname')
    serializer_class = ContactSerializer

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer

    def get_queryset(self):
        model = self.request.query_params.get('model')
        object_id = self.request.query_params.get('id')

        if model and object_id:
            # Use the Django apps module to dynamically get the model class
            model_class = apps.get_model(app_label='fcapi', model_name=model)
            # Use get_object_or_404 to get the specific object based on model and id
            obj = get_object_or_404(model_class, id=object_id)
            
            # Filter notes based on the content type and object id
            return Note.objects.filter(content_type__model=model, object_id=object_id)
        else:
            # If model or id is missing, return all notes
            return Note.objects.all()

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer

class MobileStatusView(APIView):
    def get(self, request):
        return Response({"status": "Mobile app OK"}, status=drf_status.HTTP_200_OK)

class DesktopStatusView(APIView):
    def get(self, request):
        return Response({"status": "Desktop app OK"}, status=drf_status.HTTP_200_OK)

class WebsiteStatusView(APIView):
    def get(self, request):
        return Response({"status": "Website OK"}, status=drf_status.HTTP_200_OK)

class TabletStatusView(APIView):
    def get(self, request):
        return Response({"status": "Tablet OK"}, status=drf_status.HTTP_200_OK)
