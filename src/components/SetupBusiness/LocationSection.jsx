import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { RegionDropdown } from 'react-country-region-selector';
import TextField from '../TextField';
import { restaurantService } from '../../services/restaurantService';
import { useToast } from '../../contexts/ToastContext';

const LocationSection = ({ 
  title = "Location",
  register,
  errors,
  watch,
  setValue,
  className = "",
  isEditMode = false
}) => {
  const { showError } = useToast();
  const [availableCountries, setAvailableCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  
  const selectedCountry = watch('country');

  const selectCountry = (val) => {
    setValue('country', val, { shouldValidate: true });
    setValue('state', '');
    
    const selectedCountryData = availableCountries.find(country => country.country === val);
    if (selectedCountryData) {
      setValue('country_code', selectedCountryData.country_code, { shouldValidate: true });
    }
  };

  const selectRegion = (val) => {
    setValue('state', val, { shouldValidate: true });
  };

  useEffect(() => {
    const fetchAvailableCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const result = await restaurantService.getTwilioAvailableCountries();
        if (result.success) {
          setAvailableCountries(result.data.countries || []);
        } else {
          showError('Failed to load available countries');
        }
      } catch (error) {
        showError('Error loading available countries');
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchAvailableCountries();
  }, [showError]);

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-purple-600" />
        {title}
      </h3>

      <TextField
        label="Street Address *"
        name="street_address"
        type="text"
        placeholder="123 Main Street"
        icon={MapPin}
        error={errors.street_address?.message}
        {...register('street_address', {
          required: 'Street address is required',
          minLength: {
            value: 5,
            message: 'Street address must be at least 5 characters'
          }
        })}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          label="ZIP Code *"
          name="zip_code"
          type="text"
          placeholder="Enter ZIP code"
          error={errors.zip_code?.message}
          {...register('zip_code', {
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
          <select
            value={selectedCountry}
            onChange={(e) => selectCountry(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            } ${isEditMode ? 'bg-gray-50 text-gray-500' : ''}`}
            disabled={isLoadingCountries || isEditMode}
          >
            {isLoadingCountries ? (
              <option>Loading countries...</option>
            ) : (
              <>
                <option value="">Select Country</option>
                {availableCountries.map((country) => (
                  <option key={country.country_code} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </>
            )}
          </select>
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
        <TextField
          label="Country Code"
          name="country_code"
          type="text"
          placeholder="US"
          readOnly
          error={errors.country_code?.message}
          {...register('country_code')}
        />
      </div>
    </div>
  );
};

export default LocationSection;