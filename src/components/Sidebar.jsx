import { 
  LayoutDashboard, 
  Store,
  Mic,
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Logo from '../assets/stellae-logo.png';
import { businessService } from '../services/businessService';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [businesses, setBusinesses] = useState([]);
  
  useEffect(() => {
    const fetchBusinesses = async () => {
      const result = await businessService.getBusinesses();
      if (result.success) {
        setBusinesses(result.data || []);
      }
    };
    fetchBusinesses();
  }, []);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      id: 'restaurants',
      label: 'Business',
      icon: Store,
      path: '/restaurants'
    },
    ...(businesses.length > 0 ? [{
      id: 'voice',
      label: 'Voice',
      icon: Mic,
      path: '/voice'
    }] : [])
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="w-16 md:w-64 bg-white shadow-lg transition-all duration-300 flex flex-col">
      <div className="p-3 md:p-6 flex-1">
        {/* Logo/Brand */}
        <div className="flex items-center mb-6 md:mb-8">
          <div className="h-10 w-10 flex items-center justify-center">
            <img src={Logo} alt="Logo" className="h-8 w-8 md:h-10 md:w-10" />
          </div>
          <div className="hidden md:block ml-3">
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          <div className="hidden md:block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Modules
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-2 md:px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5 md:mr-3" />
                <span className="hidden md:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-3 md:p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-2 md:px-3 py-2 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50 cursor-pointer"
          title="Logout"
        >
          <LogOut className="h-5 w-5 md:mr-3" />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
