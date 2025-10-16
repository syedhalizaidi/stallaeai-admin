import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Car, Clock, Users, Home } from 'lucide-react';
import TextField from '../TextField';
import NumberField from '../NumberField';
import TimeField from '../TimeField';
import SelectField from '../SelectField';
import { businessService } from '../../services/businessService';

const CarDealershipForm = ({ onNext }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      phone_number: '',
      email: '',
      website: '',
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

  const daysOptions = [
    { value: 'Mon, Tue, Wed, Thu, Fri', label: 'Weekdays Only' },
    { value: 'Mon, Tue, Wed, Thu, Fri, Sat', label: 'Monday to Saturday' },
    { value: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun', label: 'Every Day' }
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await businessService.addCarDealershipBusiness(data);
      if (response.success) {
        onNext();
      } else {
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
              <h2 className="text-xl font-semibold text-gray-900">Car Dealership Setup</h2>
              <p className="text-sm text-gray-600">Complete your car dealership profile</p>
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
                label="Address *"
                name="address"
                placeholder="e.g., 45 Motor City Blvd, Autoville"
                error={errors.address?.message}
                {...register('address', { required: 'Address is required' })}
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

            <TextField
              label="Website"
              name="website"
              placeholder="e.g., https://autogalaxy.com"
              error={errors.website?.message}
              {...register('website')}
            />
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
                  Creating Car Dealership...
                </>
              ) : (
                'Create Car Dealership'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarDealershipForm;
