import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/restaurants" element={<Dashboard />} />
        <Route path="/dashboard/users" element={<Dashboard />} />
        <Route path="/dashboard/settings" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
