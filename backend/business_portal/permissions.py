from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit.
    """
    def has_permission(self, request, view):
        # Allow read-only access to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions only to admin users
        return request.user and request.user.user_type == 'admin'

class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow staff and admins to initiate payments.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.user_type in ['staff', 'admin']

class IsAuditor(permissions.BasePermission):
    """
    Custom permission for auditors - read-only access.
    """
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'auditor'