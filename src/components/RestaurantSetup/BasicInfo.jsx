import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Home, Phone, Mail, Clock, Loader2, MapPin } from 'lucide-react';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import TextField from '../TextField';
import TextAreaField from '../TextAreaField';
import SelectField from '../SelectField';
import NumberField from '../NumberField';
import TimeField from '../TimeField';
import CheckboxField from '../CheckboxField';
import { restaurantService } from '../../services/restaurantService';
import { useToast } from '../../contexts/ToastContext';

const cuisineOptions = [
  { value: "Mediterranean", label: "Mediterranean" },
  { value: "Italian", label: "Italian" },
  { value: "Mexican", label: "Mexican" },
  { value: "Asian", label: "Asian" },
  { value: "American", label: "American" },
  { value: "French", label: "French" },
];

const BasicInfo = ({ onNext, editId, isEditMode }) => {
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

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
      // Location fields
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      dineIn: true,
      delivery: false,
      pickup: true,
      wheelchairAccessible: false,
      parkingAvailable: false,
    }
  });

  const selectedCountry = watch('country');

  const selectCountry = (val) => {
    setValue('country', val, { shouldValidate: true });
    setValue('state', '');
  };

  const selectRegion = (val) => {
    setValue('state', val, { shouldValidate: true });
  };

  // Load existing restaurant data for editing
  useEffect(() => {
    if (isEditMode && editId) {
      const loadRestaurantData = async () => {
        setIsLoadingData(true);
        try {
          const result = await restaurantService.getRestaurantDetails(editId);
          if (result.success && result.data) {
            const data = result.data;
            const location = data.locations?.[0] || {};

            // Set form values
            setValue('restaurantName', data.name || '');
            setValue('cuisineType', data.cuisine_type || 'Mediterranean');
            setValue('description', data.description || '');
            setValue('phone', data.phone_number || '');
            setValue('email', data.email || '');
            setValue('openingTime', data.opening_time || '');
            setValue('closingTime', data.closing_time || '');
            setValue('minDeliveryTime', data.delivery_minimum || '10');
            setValue('maxDeliveryTime', data.delivery_maximum || '30');

            // Location data
            setValue('streetAddress', location.street_address || '');
            setValue('city', location.city || '');
            setValue('state', location.state || '');
            setValue('zipCode', location.zip_code || '');
            setValue('country', location.country || 'United States');
            setValue('dineIn', location.is_dine_in_available || true);
            setValue('delivery', location.is_delivery_available || false);
            setValue('pickup', location.is_pickup_available || true);
            setValue('wheelchairAccessible', location.is_wheelchair_accessible || false);
            setValue('parkingAvailable', location.is_parking_available || false);
          } else {
            showError(result.error || 'Failed to load restaurant data');
          }
        } catch (error) {
          showError('Failed to load restaurant data');
        } finally {
          setIsLoadingData(false);
        }
      };
      loadRestaurantData();
    }
  }, [isEditMode, editId, setValue, showError]);

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const payload = {
        name: data.restaurantName,
        email: data.email.trim().toLowerCase(),
        description: data.description,
        phone_number: data.phone,
        opening_time: data.openingTime,
        closing_time: data.closingTime,
        cuisine_type: data.cuisineType,
        delivery_minimum: data.minDeliveryTime.toString(),
        delivery_maximum: data.maxDeliveryTime.toString(),
        business_type: 'restaurant',
        // Location data as array
        location: [{
          street_address: data.streetAddress,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          country: data.country,
          is_dine_in_available: data.dineIn,
          is_delivery_available: data.delivery,
          is_pickup_available: data.pickup,
          is_wheelchair_accessible: data.wheelchairAccessible,
          is_parking_available: data.parkingAvailable,
        }]
      };

      let result;
      if (isEditMode && editId) {
        result = await restaurantService.updateRestaurant(editId, payload);
      } else {
        result = await restaurantService.registerRestaurant(payload);
      }

      if (result.success) {
        localStorage.setItem('restaurant_id', result.restaurantId);
        onNext();
      } else {
        showError(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading restaurant data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Home className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? 'Edit Restaurant Info' : 'Basic Info'}
        </h2>
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

          {/* Location Section */}
          <div className="border-t pt-8 mt-8">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Location Information</h3>
            </div>

            <TextField
              label="Street Address *"
              name="streetAddress"
              type="text"
              placeholder="123 Main Street"
              icon={MapPin}
              error={errors.streetAddress?.message}
              {...register('streetAddress', {
                required: 'Street address is required',
                minLength: {
                  value: 5,
                  message: 'Street address must be at least 5 characters'
                }
              })}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TextField
                label="City *"
                name="city"
                type="text"
                placeholder="Enter city"
                error={errors.city?.message}
                {...register('city', {
                  required: 'City is required',
                  minLength: {
                    value: 2,
                    message: 'City must be at least 2 characters'
                  }
                })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <RegionDropdown
                  country={selectedCountry}
                  value={watch('state')}
                  onChange={(val) => selectRegion(val)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
                <input
                  type="hidden"
                  {...register('state', {
                    required: 'State is required'
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TextField
                label="ZIP Code *"
                name="zipCode"
                type="text"
                placeholder="Enter ZIP code"
                error={errors.zipCode?.message}
                {...register('zipCode', {
                  required: 'ZIP code is required',
                  pattern: {
                    value: /^[0-9]{5}(-[0-9]{4})?$/,
                    message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
                  }
                })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <CountryDropdown
                  value={selectedCountry}
                  onChange={(val) => selectCountry(val)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                )}
                <input
                  type="hidden"
                  {...register('country', {
                    required: 'Country is required'
                  })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Service Options</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <CheckboxField
                    label="Dine-in available"
                    name="dineIn"
                    checked={watch('dineIn')}
                    onChange={(e) => setValue('dineIn', e.target.checked)}
                    {...register('dineIn')}
                  />
                  <CheckboxField
                    label="Delivery available"
                    name="delivery"
                    checked={watch('delivery')}
                    onChange={(e) => setValue('delivery', e.target.checked)}
                    {...register('delivery')}
                  />
                </div>
                <div className="space-y-4">
                  <CheckboxField
                    label="Pickup available"
                    name="pickup"
                    checked={watch('pickup')}
                    onChange={(e) => setValue('pickup', e.target.checked)}
                    {...register('pickup')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Accessibility & Amenities</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <CheckboxField
                    label="Wheelchair accessible"
                    name="wheelchairAccessible"
                    checked={watch('wheelchairAccessible')}
                    onChange={(e) => setValue('wheelchairAccessible', e.target.checked)}
                    {...register('wheelchairAccessible')}
                  />
                </div>
                <div className="space-y-4">
                  <CheckboxField
                    label="Parking available"
                    name="parkingAvailable"
                    checked={watch('parkingAvailable')}
                    onChange={(e) => setValue('parkingAvailable', e.target.checked)}
                    {...register('parkingAvailable')}
                  />
                </div>
              </div>
            </div>
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
                {isEditMode ? 'Updating Restaurant...' : 'Creating Restaurant...'}
              </>
            ) : (
              <>
                Next: Menu
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
