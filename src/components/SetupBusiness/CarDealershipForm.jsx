import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Car, Clock, Users, Home, MapPin } from 'lucide-react';
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

const CarDealershipForm = ({ onNext, isEditMode = false, editId = null }) => {
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
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
      business_type: 'car_dealership',
      brand_specialization: '',
      total_cars_available: 0,
      avg_car_price: 0,
      min_car_price: 0,
      max_car_price: 0,
      has_service_center: true,
      has_test_drive_facility: true,
      offers_financing: true,
      offers_insurance: true,
      opening_time: '09:00',
      closing_time: '20:00',
      days_open: 'Mon, Tue, Wed, Thu, Fri, Sat',
      staff_count: 0,
      parking_capacity: 0
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
      brand_specialization: data.brand_specialization,
      total_cars_available: data.total_cars_available,
      avg_car_price: data.avg_car_price,
      min_car_price: data.min_car_price,
      max_car_price: data.max_car_price,
      has_service_center: data.has_service_center,
      has_test_drive_facility: data.has_test_drive_facility,
      offers_financing: data.offers_financing,
      offers_insurance: data.offers_insurance,
      opening_time: data.opening_time,
      closing_time: data.closing_time,
      days_open: data.days_open,
      staff_count: data.staff_count,
      parking_capacity: data.parking_capacity,
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
      }
      else {
        response = await businessService.addCarDealershipBusiness(payload);
      }

      if (response.success) {
        onNext();
      } else {
        showError(response.error)
        console.error('Error adding car dealership business:', response.error);
      }
    }
    catch (error) {
      console.error('Error adding car dealership business:', error);
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
            business_type: b.business_type || 'car_dealership',
            brand_specialization: b.brand_specialization || '',
            total_cars_available: b.total_cars_available || 0,
            avg_car_price: b.avg_car_price || 0,
            min_car_price: b.min_car_price || 0,
            max_car_price: b.max_car_price || 0,
            has_service_center: b.has_service_center ?? true,
            has_test_drive_facility: b.has_test_drive_facility ?? true,
            offers_financing: b.offers_financing ?? true,
            offers_insurance: b.offers_insurance ?? true,
            opening_time: b.opening_time || '09:00',
            closing_time: b.closing_time || '20:00',
            days_open: b.days_open || 'Mon, Tue, Wed, Thu, Fri, Sat',
            staff_count: b.staff_count || 0,
            parking_capacity: b.parking_capacity || 0,
            street_address: loc?.street_address || '',
            city: loc?.city || '',
            state: loc?.state || '',
            zip_code: loc?.zip_code || '',
            country: loc?.country || 'United States',
          })
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
              <Car className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Car Dealership' : 'Car Dealership Setup'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditMode ? 'Update your car dealership profile' : 'Complete your car dealership profile'}
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
                label="Dealership Name *"
                name="name"
                placeholder="e.g., AutoGalaxy Motors"
                error={errors.name?.message}
                {...register('name', { required: 'Dealership name is required' })}
              />
              <TextField
                label="Website"
                name="website"
                placeholder="e.g., https://autogalaxy.com"
                error={errors.website?.message}
                {...register('website')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <TextField
                label="Email"
                name="email"
                type="email"
                placeholder="e.g., info@autogalaxy.com"
                error={errors.email?.message}
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address"
                  }
                })}
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

          {/* Dealership Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Car className="h-5 w-5 mr-2 text-purple-600" />
              Dealership Details
            </h3>

            <TextField
              label="Brand Specialization"
              name="brand_specialization"
              placeholder="e.g., Toyota, Lexus"
              error={errors.brand_specialization?.message}
              {...register('brand_specialization')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberField
                label="Total Cars Available"
                name="total_cars_available"
                placeholder="e.g., 120"
                error={errors.total_cars_available?.message}
                {...register('total_cars_available')}
              />

              <NumberField
                label="Staff Count"
                name="staff_count"
                placeholder="e.g., 22"
                error={errors.staff_count?.message}
                {...register('staff_count')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumberField
                label="Average Car Price ($)"
                name="avg_car_price"
                placeholder="e.g., 38000.50"
                step="0.01"
                error={errors.avg_car_price?.message}
                {...register('avg_car_price')}
              />

              <NumberField
                label="Minimum Car Price ($)"
                name="min_car_price"
                placeholder="e.g., 15000.00"
                step="0.01"
                error={errors.min_car_price?.message}
                {...register('min_car_price')}
              />

              <NumberField
                label="Maximum Car Price ($)"
                name="max_car_price"
                placeholder="e.g., 90000.00"
                step="0.01"
                error={errors.max_car_price?.message}
                {...register('max_car_price')}
              />
            </div>

            <NumberField
              label="Parking Capacity"
              name="parking_capacity"
              placeholder="e.g., 40"
              error={errors.parking_capacity?.message}
              {...register('parking_capacity')}
            />
          </div>

          {/* Services & Facilities */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Services & Facilities
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Has Service Center"
                name="has_service_center"
                options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' }
                ]}
                error={errors.has_service_center?.message}
                {...register('has_service_center')}
              />

              <SelectField
                label="Has Test Drive Facility"
                name="has_test_drive_facility"
                options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' }
                ]}
                error={errors.has_test_drive_facility?.message}
                {...register('has_test_drive_facility')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Offers Financing"
                name="offers_financing"
                options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' }
                ]}
                error={errors.offers_financing?.message}
                {...register('offers_financing')}
              />

              <SelectField
                label="Offers Insurance"
                name="offers_insurance"
                options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' }
                ]}
                error={errors.offers_insurance?.message}
                {...register('offers_insurance')}
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
                  {isEditMode ? 'Updating Car Dealership...' : 'Creating Car Dealership...'}
                </>
              ) : (
                isEditMode ? 'Update Car Dealership' : 'Create Car Dealership'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarDealershipForm;
