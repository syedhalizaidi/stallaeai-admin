import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, ChevronRight, Loader2, Phone } from 'lucide-react';
import TextField from './TextField';
import { authService } from '../services/authService';

const SignupForm = ({ onTabChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSubmitMessage('');

    try {
      const payload = {
        full_name: data.fullName,
        email: data.email,
        phone_number: data.phoneNumber,
        password: data.password,
        role: 'Admin'
      }
      const result = await authService.signup(payload);

      if (result.success) {
        setSubmitMessage('Account created successfully! You can now login.');
        reset();
        onTabChange('login');
      } else {
        setSubmitMessage(result.error);
      }
    } catch (error) {
      setSubmitMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={User}
          error={errors.fullName?.message}
          {...register('fullName', {
            required: 'Full name is required',
            minLength: {
              value: 2,
              message: 'Full name must be at least 2 characters'
            }
          })}
        />

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
          label="Phone Number"
          type="tel"
          placeholder="12345678"
          icon={Phone}
          error={errors.phoneNumber?.message}
          {...register("phoneNumber", {
            required: "Phone number is required",
            minLength: {
              value: 8,
              message: "Phone number must be at least 8 digits"
            }
          })}
        />

        <TextField
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message}
          autoComplete="new-password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters"
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            }
          })}
        />

        <TextField
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
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
              Register
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
