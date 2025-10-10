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
      label: 'Restaurants',
      icon: Store,
      path: '/restaurants'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        {/* Logo/Brand */}
        <div className="flex items-center mb-8">
          <div className="h-22 w-22 flex items-center justify-center">
            <img src={Logo} alt="Logo" className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Modules
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
