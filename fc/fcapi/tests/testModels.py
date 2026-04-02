
from django.test import TestCase
from ..models import Company, Role, Contact, Note, Job, Log
from django.utils import timezone

class CompanyModelTest(TestCase):
    def test_create_company(self):
        company = Company.objects.create(
            name="Test Company",
            address="123 Test St",
            description="Test description",
            url="http://example.com",
            mapurl="http://example.com/map"
        )
        self.assertEqual(company.name, "Test Company")

class RoleModelTest(TestCase):
    def test_create_role(self):
        company = Company.objects.create(name="Test Company")
        role = Role.objects.create(
            name="Test Role",
            company=company
        )
        self.assertEqual(role.name, "Test Role")

class ContactModelTest(TestCase):
    def test_create_contact(self):
        company = Company.objects.create(name="Test Company")
        role = Role.objects.create(name="Test Role", company=company)
        contact = Contact.objects.create(
            fname="John",
            lname="Doe",
            email="john@example.com",
            phone="123-456-7890"
        )
        contact.role.add(role)
        self.assertEqual(contact.fname, "John")
        self.assertEqual(contact.role.first().name, "Test Role")

class NoteModelTest(TestCase):
    def test_create_note(self):
        note = Note.objects.create(
            content="Test content"
        )
        self.assertIsNotNone(note.created)
        self.assertIsNotNone(note.last_update)

class JobModelTest(TestCase):
    def test_create_job(self):
        company = Company.objects.create(name="Test Company")
        role = Role.objects.create(name="Test Role", company=company)
        contact = Contact.objects.create(fname="John", lname="Doe", email="john@example.com")
        contact.role.add(role)
        job = Job.objects.create(
            title="Test Job",
            description="Test description",
            url="http://example.com/job",
            company=company
        )
        job.contacts.add(contact)
        self.assertEqual(job.title, "Test Job")
        self.assertEqual(job.company.name, "Test Company")
        self.assertEqual(job.contacts.first().fname, "John")

class LogModelTest(TestCase):
    def test_create_log(self):
        log = Log.objects.create(
            content="Test log content"
        )
        self.assertIsNotNone(log.created)
        self.assertIsNotNone(log.last_update)