import { Navigate, useLocation } from 'react-router-dom';
import { PERMISSION_ROUTE_MAP } from '../constants/permissionRouteMap';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const userRole = localStorage.getItem('userRole')?.replace(/"/g, '');
  const userPermissionsStr = localStorage.getItem('userPermissions');
  const userPermissions = userPermissionsStr ? JSON.parse(userPermissionsStr) : [];
  
  // Admin has access to everything
  if (userRole === 'Admin') {
    return children;
  }
  const allowedAppRoutes = userPermissions
    .map((perm) => PERMISSION_ROUTE_MAP[perm] || perm)
    .filter(Boolean);
  const currentPath = location.pathname;
  if (allowedAppRoutes.includes(currentPath)) {
    return children;
  }
  return <Navigate to="/dashboard" replace />;
};

export default ProtectedRoute;
