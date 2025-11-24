// Get user permissions from localStorage
export const getUserPermissions = () => {
  const userPermissionsStr = localStorage.getItem('userPermissions');
  return userPermissionsStr ? JSON.parse(userPermissionsStr) : [];
};

// Check if user has a specific permission
export const hasPermission = (route) => {
  const permissions = getUserPermissions();
  return permissions.includes(route);
};

// Check if user has any of the given permissions
export const hasAnyPermission = (routes) => {
  const permissions = getUserPermissions();
  return routes.some(route => permissions.includes(route));
};

// Check if user has all of the given permissions
export const hasAllPermissions = (routes) => {
  const permissions = getUserPermissions();
  return routes.every(route => permissions.includes(route));
};

// Get user role from localStorage
export const getUserRole = () => {
  const userRole = localStorage.getItem('userRole');
  return userRole ? userRole.replace(/"/g, '') : null;
};

// Clear all user data from localStorage
export const clearUserData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userPermissions');
};
