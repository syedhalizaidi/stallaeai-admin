import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Home, Phone, Mail, Clock, Loader2 } from 'lucide-react';
import TextField from '../TextField';
import TextAreaField from '../TextAreaField';
import SelectField from '../SelectField';
import NumberField from '../NumberField';
import TimeField from '../TimeField';
import { restaurantService } from '../../services/restaurantService';

const cuisineOptions = [
  { value: "Mediterranean", label: "Mediterranean" },
  { value: "Italian", label: "Italian" },
  { value: "Mexican", label: "Mexican" },
  { value: "Asian", label: "Asian" },
  { value: "American", label: "American" },
  { value: "French", label: "French" },
];

const BasicInfo = ({ onNext }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      restaurantName: '',
      cuisineType: 'Mediterranean',
      description: '',
      phone: '',
      email: '',
      openingTime: '',
      closingTime: '',
      minDeliveryTime: "10",
      maxDeliveryTime: "30",
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await restaurantService.registerRestaurant({
        name: data.restaurantName,
        email: data.email.trim().toLowerCase(),
        description: data.description,
        phone_number: data.phone,
        opening_time: data.openingTime,
        closing_time: data.closingTime,
        cuisine_type: data.cuisineType,
        delivery_minimum: data.minDeliveryTime.toString(),
        delivery_maximum: data.maxDeliveryTime.toString(),
        business_type: 'restaurant'
      });

      if (result.success) {
        localStorage.setItem('restaurant_id', result.restaurantId);
        onNext();
      } else {
        console.error('Registration failed:', result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Home className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">Basic Info</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TextField
              label="Restaurant Name *"
              name="restaurantName"
              type="text"
              placeholder="Your Restaurant Name"
              icon={Home}
              error={errors.restaurantName?.message}
              {...register('restaurantName', {
                required: 'Restaurant name is required',
              })}
            />

            <SelectField
              label="Cuisine Type *"
              name="cuisineType"
              value={watch('cuisineType')}
              options={cuisineOptions}
              placeholder="Select an option"
              error={errors.cuisineType?.message}
              required
              {...register('cuisineType', {
                required: 'Cuisine type is required',
                validate: (value) => value !== '' || 'Please select a cuisine type'
              })}
            />
          </div>

          <TextAreaField
            label="Restaurant Description *"
            name="description"
            placeholder="Tell customers about your restaurant, specialties, atmosphere..."
            rows={4}
            error={errors.description?.message}
            {...register('description', {
              required: 'Restaurant description is required',
            })}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TextField
              label="Restaurant Phone *"
              name="phone"
              type="tel"
              placeholder="1234567890"
              icon={Phone}
              error={errors.phone?.message}
              {...register('phone', {
                required: 'Phone number is required',
                minLength: {
                  value: 8,
                  message: "Phone number must be at least 8 digits"
                }
              })}
            />

            <TextField
              label="Contact Email *"
              name="email"
              type="email"
              placeholder="restaurant@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimeField
              label="Opening Time *"
              name="openingTime"
              icon={Clock}
              error={errors.openingTime?.message}
              {...register('openingTime', {
                required: 'Opening time is required'
              })}
            />

            <TimeField
              label="Closing Time *"
              name="closingTime"
              icon={Clock}
              error={errors.closingTime?.message}
              {...register('closingTime', {
                required: 'Closing time is required'
              })}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NumberField
              label="Minimum Delivery Time *"
              name="minDeliveryTime"
              min="1"
              icon={Clock}
              error={errors.minDeliveryTime?.message}
              {...register('minDeliveryTime', {
                required: 'Minimum delivery time is required',
                min: {
                  value: 1,
                  message: 'Minimum delivery time must be at least 1 minute'
                },
                valueAsNumber: true
              })}
            />

            <NumberField
              label="Maximum Delivery Time *"
              name="maxDeliveryTime"
              min="1"
              icon={Clock}
              error={errors.maxDeliveryTime?.message}
              {...register('maxDeliveryTime', {
                required: 'Maximum delivery time is required',
                min: {
                  value: 1,
                  message: 'Maximum delivery time must be at least 1 minute'
                },
                valueAsNumber: true,
                validate: (value) => {
                  const minTime = watch('minDeliveryTime');
                  return value >= minTime || 'Maximum delivery time must be greater than or equal to minimum delivery time';
                }
              })}
            />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${isLoading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Restaurant...
              </>
            ) : (
              <>
                Next: Location
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfo;
