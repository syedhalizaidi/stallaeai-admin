import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [], requiredRoute = null }) => {
  const userRole = localStorage.getItem('userRole')?.replace(/"/g, '');
  const userPermissionsStr = localStorage.getItem('userPermissions');
  const userPermissions = userPermissionsStr ? JSON.parse(userPermissionsStr) : [];
  
  // Admin has access to everything
  if (userRole === 'Admin') {
    return children;
  }
  
  // Check route-based permissions if requiredRoute is specified
  if (requiredRoute) {
    if (!userPermissions.includes(requiredRoute)) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }
  
  // If no specific roles are allowed, allow all authenticated users
  if (allowedRoles.length === 0) {
    return children;
  }
  
  // Check if user role is in allowed roles
  if (allowedRoles.includes(userRole)) {
    return children;
  }
  
  // Redirect to dashboard if user doesn't have permission
  return <Navigate to="/dashboard" replace />;
};

export default ProtectedRoute;
