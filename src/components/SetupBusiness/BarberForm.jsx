import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Scissors, Clock, Users, Home } from 'lucide-react';
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
      email: '',
      website: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
      country_code: 'US',
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
      offers_home_service: false,
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
      country_code: data.country_code,
      locations: [
        {
          street_address: data.street_address,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          country: data.country
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
        response = await businessService.addBarberBusiness(payload);
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
            country_code: b.country_code || 'US',
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <LocationSection
            title="Location"
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            isEditMode={isEditMode}
          />

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
