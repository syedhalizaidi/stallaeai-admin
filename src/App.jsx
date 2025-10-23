import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantSetupPage from './pages/RestaurantSetupPage';
import VoicePage from './pages/VoicePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route
            path="/setup"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Proprietor']}>
                <RestaurantSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voice"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Proprietor']}>
                <VoicePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
