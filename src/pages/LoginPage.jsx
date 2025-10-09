import { useState } from 'react';
import { Shield } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import Logo from '../assets/stellae-logo.png';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('signup');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="mx-auto h-22 w-22 flex items-center justify-center">
          <img src={Logo} alt="Logo" className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-purple-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Secure access to your dashboard</p>
      </div>

      <div className="w-[600px]">
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
            <p className="text-gray-600">Sign in to your account or create a new one</p>
          </div>

          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === 'login'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === 'signup'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Sign Up
            </button>
          </div>

          {activeTab === 'signup' ? (
            <SignupForm />
          ) : (
            <LoginForm />
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Protected by enterprise-grade security</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
