import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import TextField from '../components/TextField';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/stellae-logo.png';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSubmitMessage({ text: '', type: '' });
    const result = await authService.forgotPassword(data);
    setIsLoading(false);
    if (result.success) {
      setSubmitMessage({ text: result.message || 'If an account exists for this email, you will receive a password reset link.', type: 'success' });
    } else {
      setSubmitMessage({ text: result.error, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto h-16 w-16 sm:h-22 sm:w-22 flex items-center justify-center mb-2">
        <img src={Logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-900 mb-2">Admin Panel</h1>
      <p className="text-sm sm:text-base text-gray-600">Secure access to your dashboard</p>

      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[600px] mt-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
            <p className="text-sm sm:text-base text-gray-600">Enter your email to receive a reset link</p>
          </div>

          {submitMessage.text && (
            <div className={`p-4 rounded-lg text-sm mb-6 ${submitMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TextField
              label="Email"
              type="email"
              name="email"
              placeholder="admin@example.com"
              icon={Mail}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <>
                  Send Reset Link
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-500 cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
