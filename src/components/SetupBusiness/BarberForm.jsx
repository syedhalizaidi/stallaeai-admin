import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Scissors, Clock, Users, Home, MapPin } from 'lucide-react';
import TextField from '../TextField';
import NumberField from '../NumberField';
import TimeField from '../TimeField';
import SelectField from '../SelectField';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { businessService } from '../../services/businessService';
import { useToast } from '../../contexts/ToastContext';

const daysOptions = [
  { value: 'Mon, Tue, Wed, Thu, Fri', label: 'Weekdays Only' },
  { value: 'Mon, Tue, Wed, Thu, Fri, Sat', label: 'Monday to Saturday' },
  { value: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun', label: 'Every Day' }
];

const BarberForm = ({ onNext, isEditMode = false, editId = null }) => {
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      phone_number: '',
      email: '',
      website: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
      business_type: 'barber',
      chair_count: 1,
      average_haircut_time: 30,
      appointment_required: false,
      accepts_walkins: true,
      services_offered: 'Haircut',
      base_haircut_price: 15.0,
      premium_service_price: 40.0,
      opening_time: '09:00',
      closing_time: '21:00',
      days_open: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun',
      has_waiting_area: true,
      offers_home_service: false
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

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      phone_number: data.phone_number,
      email: data.email,
      website: data.website,
      business_type: data.business_type,
      chair_count: data.chair_count,
      average_haircut_time: data.average_haircut_time,
      appointment_required: data.appointment_required,
      accepts_walkins: data.accepts_walkins,
      services_offered: data.services_offered,
      base_haircut_price: data.base_haircut_price,
      premium_service_price: data.premium_service_price,
      opening_time: data.opening_time,
      closing_time: data.closing_time,
      days_open: data.days_open,
      has_waiting_area: data.has_waiting_area,
      offers_home_service: data.offers_home_service,
      location: [
        {
          street_address: data.street_address,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          country: data.country,
        }
      ]
    }

    setIsLoading(true);

    try {
      let response;
      if (isEditMode && editId) {
        response = await businessService.updateBusiness(editId, payload);
      } else {
        response = await businessService.addBarberBusiness(payload);
      }

      if (response.success) {
        onNext();
      } else {
        showError(response.error)
        console.error(`Error ${isEditMode ? 'updating' : 'adding'} barber business:`, response.error);
      }
    }
    catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} barber business:`, error);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode && editId) {
      const fetchBusiness = async () => {
        const response = await businessService.getBusinessById(editId);
        if (response.success) {
          const b = response.data || {};
          // Support both array and object for location from API
          const loc = Array.isArray(b.locations) ? b.locations[b.locations.length - 1] : b.locations;

          reset({
            name: b.name || '',
            phone_number: b.phone_number || '',
            email: b.email || '',
            website: b.website || '',
            business_type: b.business_type || 'barber',
            chair_count: b.chair_count ?? 1,
            average_haircut_time: b.average_haircut_time ?? 30,
            appointment_required: b.appointment_required ?? false,
            accepts_walkins: b.accepts_walkins ?? true,
            services_offered: b.services_offered || 'Haircut',
            base_haircut_price: b.base_haircut_price ?? 15.0,
            premium_service_price: b.premium_service_price ?? 40.0,
            opening_time: b.opening_time || '09:00',
            closing_time: b.closing_time || '21:00',
            days_open: b.days_open || 'Mon, Tue, Wed, Thu, Fri, Sat, Sun',
            has_waiting_area: b.has_waiting_area ?? true,
            offers_home_service: b.offers_home_service ?? false,
            street_address: loc?.street_address || '',
            city: loc?.city || '',
            state: loc?.state || '',
            zip_code: loc?.zip_code || '',
            country: loc?.country || 'United States',
          });
        }
      };
      fetchBusiness();
    }
  }, [isEditMode, editId]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Scissors className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Barber Shop' : 'Barber Shop Setup'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditMode ? 'Update your barber shop profile' : 'Complete your barber shop profile'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Home className="h-5 w-5 mr-2 text-purple-600" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Barber Shop Name *"
                name="name"
                placeholder="e.g., Fade Masters"
                error={errors.name?.message}
                {...register('name', { required: 'Barber shop name is required' })}
              />
              <TextField
                label="Phone Number"
                name="phone_number"
                placeholder="e.g., 12345678"
                error={errors.phone_number?.message}
                {...register('phone_number', {
                  minLength: {
                    value: 8,
                    message: "Phone number must be at least 8 digits"
                  }
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Email"
                name="email"
                type="email"
                placeholder="e.g., hello@fademasters.com"
                error={errors.email?.message}
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address"
                  }
                })}
              />
              <TextField
                label="Website"
                name="website"
                placeholder="e.g., https://fademasters.com"
                error={errors.website?.message}
                {...register('website')}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-600" />
              Location
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Barber Shop Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Scissors className="h-5 w-5 mr-2 text-purple-600" />
              Barber Shop Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberField
                label="Number of Chairs"
                name="chair_count"
                placeholder="e.g., 5"
                error={errors.chair_count?.message}
                {...register('chair_count')}
              />

              <NumberField
                label="Average Haircut Time (minutes)"
                name="average_haircut_time"
                placeholder="e.g., 30"
                error={errors.average_haircut_time?.message}
                {...register('average_haircut_time')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberField
                label="Base Haircut Price ($)"
                name="base_haircut_price"
                placeholder="e.g., 15.00"
                step="0.01"
                error={errors.base_haircut_price?.message}
                {...register('base_haircut_price')}
              />

              <NumberField
                label="Premium Service Price ($)"
                name="premium_service_price"
                placeholder="e.g., 40.00"
                step="0.01"
                error={errors.premium_service_price?.message}
                {...register('premium_service_price')}
              />
            </div>
          </div>

          {/* Services & Policies */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Services & Policies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Services Offered"
                name="services_offered"
                options={[
                  { value: 'Haircut', label: 'Haircut' },
                  { value: 'Beard Trim', label: 'Beard Trim' },
                  { value: 'Facial', label: 'Facial' }
                ]}
                placeholder="Select services offered"
                error={errors.services_offered?.message}
                {...register('services_offered')}
              />
              <SelectField
                label="Appointment Required"
                name="appointment_required"
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' }
                ]}
                error={errors.appointment_required?.message}
                {...register('appointment_required')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Accepts Walk-ins"
                name="accepts_walkins"
                options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' }
                ]}
                error={errors.accepts_walkins?.message}
                {...register('accepts_walkins')}
              />
              <SelectField
                label="Has Waiting Area"
                name="has_waiting_area"
                options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' }
                ]}
                error={errors.has_waiting_area?.message}
                {...register('has_waiting_area')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Offers Home Service"
                name="offers_home_service"
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' }
                ]}
                error={errors.offers_home_service?.message}
                {...register('offers_home_service')}
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              Operating Hours
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TimeField
                label="Opening Time"
                name="opening_time"
                error={errors.opening_time?.message}
                {...register('opening_time')}
              />

              <TimeField
                label="Closing Time"
                name="closing_time"
                error={errors.closing_time?.message}
                {...register('closing_time')}
              />

              <SelectField
                label="Days Open"
                name="days_open"
                options={daysOptions}
                error={errors.days_open?.message}
                {...register('days_open')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${isLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditMode ? 'Updating Barber Shop...' : 'Creating Barber Shop...'}
                </>
              ) : (
                isEditMode ? 'Update Barber Shop' : 'Create Barber Shop'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BarberForm;
