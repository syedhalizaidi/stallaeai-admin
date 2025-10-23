import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userRole = localStorage.getItem('userRole')?.replace(/"/g, '');
  
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
