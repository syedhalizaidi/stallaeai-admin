import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Car, Clock, Users, Home } from 'lucide-react';
import TextField from '../TextField';
import NumberField from '../NumberField';
import TimeField from '../TimeField';
import SelectField from '../SelectField';
import LocationSection from './LocationSection';
import { businessService } from '../../services/businessService';
import { userService } from "../../services/userService";
import { ROUTES } from "../../constants/routes";
import { User, Shield, Lock, Phone as PhoneIcon, Mail } from "lucide-react";
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
      email: '',
      website: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
      country_code: 'US',
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
      parking_capacity: 0,
      staffFullName: "",
      staffEmail: "",
      staffPassword: "",
      staffPhoneNumber: "",
    }
  });


  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
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
      country_code: data.country_code,
      locations: [
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
        if (response.success) {
          onNext();
        } else {
          showError(response.error);
        }
      } else {
        response = await businessService.addCarDealershipBusiness(payload);
        if (response.success) {
          const businessId = response.data?.id || response.businessId;
          localStorage.setItem("restaurant_id", businessId);
          localStorage.setItem("business_id", businessId);

          const staffPayload = {
            full_name: data.staffFullName,
            email: data.staffEmail,
            password: data.staffPassword,
            phone_number: data.staffPhoneNumber,
            role: "Proprietor",
            business_id: businessId,
            business_ids: [businessId],
            permissions: ROUTES.map((r) => r.value),
            businesses: [
              {
                ...payload,
                id: businessId,
              },
            ],
          };

          const staffResult = await userService.createUser(staffPayload);
          if (!staffResult.success) {
            console.error("Staff registration failed:", staffResult.error);
          }
          onNext();
        } else {
          showError(response.error);
        }
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
            country_code: b.country_code || 'US',
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
          <LocationSection 
            title="Location"
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            isEditMode={isEditMode}
          />

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

          {!isEditMode && (
            <div className="border-t pt-8 mt-8">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Primary Staff Member
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Full Name *"
                  type="text"
                  placeholder="Enter full name"
                  icon={User}
                  error={errors.staffFullName?.message}
                  {...register("staffFullName", {
                    required: !isEditMode ? "Full name is required" : false,
                  })}
                />
                <TextField
                  label="Email *"
                  type="email"
                  placeholder="Enter email address"
                  icon={Mail}
                  error={errors.staffEmail?.message}
                  {...register("staffEmail", {
                    required: !isEditMode ? "Email is required" : false,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <TextField
                  label="Password *"
                  type="password"
                  placeholder="Enter password"
                  icon={Lock}
                  error={errors.staffPassword?.message}
                  {...register("staffPassword", {
                    required: !isEditMode ? "Password is required" : false,
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                <TextField
                  label="Phone Number *"
                  type="tel"
                  placeholder="1234567890"
                  icon={PhoneIcon}
                  error={errors.staffPhoneNumber?.message}
                  {...register("staffPhoneNumber", {
                    required: !isEditMode ? "Phone number is required" : false,
                    minLength: {
                      value: 8,
                      message: "Phone number must be at least 8 digits",
                    },
                  })}
                />
              </div>
            </div>
          )}

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
