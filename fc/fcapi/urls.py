from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContactViewSet, NoteViewSet, RoleViewSet, CompanyViewSet,
    JobViewSet, LogViewSet,
    MobileStatusView, DesktopStatusView, WebsiteStatusView, TabletStatusView
)

# Custom router with optional trailing slash
class OptionalSlashRouter(DefaultRouter):
    trailing_slash = '/?'

router = OptionalSlashRouter()
router.register(r'contacts', ContactViewSet)
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'roles', RoleViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'logs', LogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('mobile/?', MobileStatusView.as_view(), name='mobile-status'),
    path('desktop/?', DesktopStatusView.as_view(), name='desktop-status'),
    path('website/?', WebsiteStatusView.as_view(), name='website-status'),
    path('tablet/?', TabletStatusView.as_view(), name='tablet-status'),
]
