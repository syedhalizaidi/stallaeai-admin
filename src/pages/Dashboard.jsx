import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardModule from '../components/DashboardModule';
import RestaurantsModule from '../components/RestaurantsModule';
import UsersModule from '../components/UsersModule';
import SettingsModule from '../components/SettingsModule';

const Dashboard = () => {
  const location = useLocation();
  
  // Get the current module from the URL path
  const getCurrentModule = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/dashboard/restaurants') return 'restaurants';
    if (path === '/dashboard/users') return 'users';
    if (path === '/dashboard/settings') return 'settings';
    return 'dashboard';
  };

  const currentModule = getCurrentModule();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 capitalize">{currentModule}</h1>
        </div>

        {currentModule === 'dashboard' && <DashboardModule />}
        {currentModule === 'restaurants' && <RestaurantsModule />}
        {currentModule === 'users' && <UsersModule />}
        {currentModule === 'settings' && <SettingsModule />}
      </div>
    </div>
  );
};

export default Dashboard;
