import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardModule from '../components/DashboardModule';

const Dashboard = () => {
  const location = useLocation();
  
  const getCurrentModule = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    return 'dashboard';
  };

  const currentModule = getCurrentModule();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 p-8">
        {currentModule === 'dashboard' && <DashboardModule />}
      </div>
    </div>
  );
};

export default Dashboard;
