import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ChevronRight, Loader2 } from 'lucide-react';
import TextField from './TextField';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const payload = {
      email: data.email,
      password: data.password
    }
    const result = await authService.login(payload);
    if (result.success) {
      setIsLoading(false);
      localStorage.setItem('authToken', result.data.tokens.access_token);
      localStorage.setItem('userRole', JSON.stringify(result.data.role));
      navigate('/dashboard');
    } else {
      setIsLoading(false);
      setSubmitMessage(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {submitMessage && (
        <div className={`p-4 rounded-lg text-sm ${submitMessage.includes('successfully')
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {submitMessage}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <TextField
          label="Email"
          type="email"
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

        <TextField
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message}
          autoComplete="current-password"
          {...register('password', {
            required: 'Password is required'
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
              Sign In
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
