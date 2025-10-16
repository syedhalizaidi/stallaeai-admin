import { 
  LayoutDashboard, 
  Store
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/stellae-logo.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-16 md:w-64 bg-white shadow-lg transition-all duration-300">
      <div className="p-3 md:p-6">
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
    </div>
  );
};

export default Sidebar;
