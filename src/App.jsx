import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantSetupPage from './pages/RestaurantSetupPage';
import ProtectedRoute from './components/ProtectedRoute';
import KnowledgePage from './pages/KnowledgePage';
import NotificationPage from './pages/NotificationsPage';
import ManageMenu from './pages/ManageMenu';
import Layout from './components/Layout';
import AddStaffPage from './pages/AddStaffPage';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<Layout />}> 
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/restaurants" element={<RestaurantsPage />} />
            <Route
              path="/setup"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Proprietor"]} requiredRoute="/setup">
                  <RestaurantSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowledge-base"
              element={
                <ProtectedRoute allowedRoles={["Admin"]} requiredRoute="/knowledge-base">
                  <KnowledgePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={["Admin"]} requiredRoute="/notifications">
                  <NotificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu-management"
              element={
                <ProtectedRoute allowedRoles={["Admin"]} requiredRoute="/menu-management">
                  <ManageMenu />
                </ProtectedRoute>
              }
            />

             <Route
              path="/add-staff"
              element={
                <ProtectedRoute allowedRoles={["Admin"]} requiredRoute="/add-staff">
                  <AddStaffPage />
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
