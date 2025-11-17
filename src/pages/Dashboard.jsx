import { useLocation } from 'react-router-dom';
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
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      {currentModule === 'dashboard' && <DashboardModule />}
    </div>
  );
};

export default Dashboard;
