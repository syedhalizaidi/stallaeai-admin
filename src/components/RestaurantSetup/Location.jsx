import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, ArrowLeft, ChevronRight } from 'lucide-react';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import TextField from '../TextField';
import CheckboxField from '../CheckboxField';
import { restaurantService } from '../../services/restaurantService';

const Location = ({ onNext, onPrevious }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
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
    },
  });

  const selectedCountry = watch('country');

  const selectCountry = (val) => {
    setValue('country', val, { shouldValidate: true });
    setValue('state', '');
  };

  const selectRegion = (val) => {
    setValue('state', val, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    const restaurantId = localStorage.getItem('restaurant_id');
    setIsLoading(true);
    try {
      const result = await restaurantService.createRestaurantLocation(restaurantId,{
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
      });
      if (result.success) {
        onNext();
      } else {
        console.error('Registration failed:', result.error);
      }
    } catch (error) {
      console.error('Error submitting location form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <MapPin className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">Location</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
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
            <h3 className="text-lg font-medium text-gray-900">Service Options</h3>
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
            <h3 className="text-lg font-medium text-gray-900">Accessibility & Amenities</h3>
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

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors invisible"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            }`}
          >
            {isLoading ? (
              'Saving...'
            ) : (
              <>
                Next: Menu
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Location;
