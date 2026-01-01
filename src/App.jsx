import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { BusinessProvider } from './contexts/BusinessContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RestaurantSetupPage from './pages/RestaurantSetupPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationPage from './pages/NotificationsPage';
import Layout from './components/Layout';

function App() {
  return (
    <ToastProvider>
      <BusinessProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route element={<Layout />}> 
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/setup"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <RestaurantSetupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <NotificationPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </BusinessProvider>
    </ToastProvider>
  )
}

export default App
