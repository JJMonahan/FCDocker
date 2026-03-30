from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import (
    ContactViewSet, NoteViewSet, RoleViewSet, CompanyViewSet,
    JobViewSet, LogViewSet,
    MobileStatusView, DesktopStatusView, WebsiteStatusView, TabletStatusView
)

# Standard router for basic functionality
router = DefaultRouter()
router.register(r'contacts', ContactViewSet)
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'roles', RoleViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'logs', LogViewSet)

# Additional patterns for URLs without trailing slash
additional_patterns = [
    re_path(r'^contacts/?$', ContactViewSet.as_view({'get': 'list', 'post': 'create'}), name='contact-list-optional'),
    re_path(r'^contacts/(?P<pk>[^/.]+)/?$', ContactViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='contact-detail-optional'),
    re_path(r'^notes/?$', NoteViewSet.as_view({'get': 'list', 'post': 'create'}), name='note-list-optional'),
    re_path(r'^notes/(?P<pk>[^/.]+)/?$', NoteViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='note-detail-optional'),
    re_path(r'^roles/?$', RoleViewSet.as_view({'get': 'list', 'post': 'create'}), name='role-list-optional'),
    re_path(r'^roles/(?P<pk>[^/.]+)/?$', RoleViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='role-detail-optional'),
    re_path(r'^companies/?$', CompanyViewSet.as_view({'get': 'list', 'post': 'create'}), name='company-list-optional'),
    re_path(r'^companies/(?P<pk>[^/.]+)/?$', CompanyViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='company-detail-optional'),
    re_path(r'^jobs/?$', JobViewSet.as_view({'get': 'list', 'post': 'create'}), name='job-list-optional'),
    re_path(r'^jobs/(?P<pk>[^/.]+)/?$', JobViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='job-detail-optional'),
    re_path(r'^logs/?$', LogViewSet.as_view({'get': 'list', 'post': 'create'}), name='log-list-optional'),
    re_path(r'^logs/(?P<pk>[^/.]+)/?$', LogViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='log-detail-optional'),
]
urlpatterns = [
    path('', include(router.urls)),
    path('mobile/?', MobileStatusView.as_view(), name='mobile-status'),
    path('desktop/?', DesktopStatusView.as_view(), name='desktop-status'),
    path('website/?', WebsiteStatusView.as_view(), name='website-status'),
    path('tablet/?', TabletStatusView.as_view(), name='tablet-status'),
] + additional_patterns
