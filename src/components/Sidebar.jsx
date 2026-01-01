import {
  LayoutDashboard,
  Store,
  LogOut,
  FileStack,
  Bell,
  Menu,
  UserPlus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/stellae-logo.png';
import { hasPermission, clearUserData, getUserRole } from '../utils/permissionUtils';
import { PERMISSION_ROUTE_MAP } from '../constants/permissionRouteMap';

const Sidebar = () => {
  const navigate = useNavigate();
  // const location = useLocation(); // Not needed for header if we don't have nav links

  const handleLogout = () => {
    clearUserData();
    navigate('/');
  };

  return (
    <div className="w-full h-16 bg-white shadow-sm z-50 relative">
      <div className="h-full w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <div className="h-8 w-8 flex items-center justify-center mr-2">
            <img src={Logo} alt="Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Stellae AI</h1>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center">
            <button
            onClick={handleLogout}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            title="Logout"
            >
            <span className="mr-2">Logout</span>
            {/* Using LogOut icon from existing imports but maybe small/subtle */}
            {/* <LogOut className="h-4 w-4" /> */} 
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
