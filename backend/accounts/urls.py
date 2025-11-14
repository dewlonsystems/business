from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),  # Changed to class-based view
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.user_profile, name='profile'),
]