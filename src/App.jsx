import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantSetupPage from './pages/RestaurantSetupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/setup" element={<RestaurantSetupPage />} />
      </Routes>
    </Router>
  )
}

export default App
