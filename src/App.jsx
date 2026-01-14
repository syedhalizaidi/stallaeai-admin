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
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={
            <BusinessProvider>
              <Layout />
            </BusinessProvider>
          }>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
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
    </ToastProvider>
  )
}

export default App
