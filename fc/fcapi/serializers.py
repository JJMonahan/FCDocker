from rest_framework import serializers
from .models import Contact, Note, Role, Company, Job, Log

class RoleSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)  # Add this line

    class Meta:
        model = Role
        fields = '__all__'
        
class ContactSerializerXXX(serializers.ModelSerializer):
    role = RoleSerializer(many=True)
    class Meta:
        model = Contact
        fields = '__all__'

class ContactSerializer(serializers.ModelSerializer):
    role = RoleSerializer(many=True, required=False)  # Make role optional

    class Meta:
        model = Contact
        fields = '__all__'

    def create(self, validated_data):
        roles_data = validated_data.pop('role', [])
        contact = Contact.objects.create(**validated_data)
        if roles_data:
            # Assuming you want to save related roles if provided
            for role_data in roles_data:
                role = Role.objects.get_or_create(**role_data)
                contact.role.add(role)
        return contact

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'



class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    contacts = ContactSerializer(many=True)
    company = CompanySerializer()  # Assuming you have a CompanySerializer
    class Meta:
        model = Job
        fields = '__all__'

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = '__all__'
