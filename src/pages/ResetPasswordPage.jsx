import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, ChevronRight, Loader2 } from 'lucide-react';
import TextField from '../components/TextField';
import { authService } from '../services/authService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../assets/stellae-logo.png';

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      new_password: '',
      confirm_password: ''
    }
  });

  const newPassword = watch('new_password');

  const onSubmit = async (data) => {
    if (!token) {
      setSubmitMessage({ text: 'Reset token is missing from URL.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setSubmitMessage({ text: '', type: '' });
    
    const payload = {
      token: token,
      new_password: data.new_password
    };

    const result = await authService.resetPassword(payload);
    setIsLoading(false);
    
    if (result.success) {
      setSubmitMessage({ text: 'Password reset successful! Redirecting to login...', type: 'success' });
      setTimeout(() => {
        navigate('/');
      }, 3000);
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
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-sm sm:text-base text-gray-600">Set your new password below</p>
          </div>

          {!token && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg text-sm bg-amber-50 text-amber-700 border border-amber-200">
                Invalid or missing reset token. Please check your email link or request a new one.
              </div>
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full my-4 flex justify-center items-center py-2 px-4 border border-purple-200 rounded-lg text-sm font-medium text-purple-600 bg-white hover:bg-purple-50 transition-colors cursor-pointer"
              >
                Return to Forgot Password to get a New Link
              </button>
            </div>
          )}

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
              label="New Password"
              type="password"
              name="new_password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.new_password?.message}
              {...register('new_password', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
            />

            <TextField
              label="Confirm New Password"
              type="password"
              name="confirm_password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirm_password?.message}
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match'
              })}
            />

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <>
                  Reset Password
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
