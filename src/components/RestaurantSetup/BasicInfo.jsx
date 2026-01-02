import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Home, Mail, Clock, Loader2, MapPin } from "lucide-react";
import { RegionDropdown } from "react-country-region-selector";
import TextField from "../TextField";
import TextAreaField from "../TextAreaField";
import SelectField from "../SelectField";
import NumberField from "../NumberField";
import CheckboxField from "../CheckboxField";
import { restaurantService } from "../../services/restaurantService";
import { userService } from "../../services/userService";
import { ROUTES } from "../../constants/routes";
import { User, Lock, Phone } from "lucide-react";

const BUSINESS_CONFIG = {
  restaurant: {
    showCuisine: true,
    showDeliveryTime: true,
    showServiceOptions: true,
    showAccessibility: true,
    tableRequired: true,
  },
  barber: {
    showCuisine: false,
    showDeliveryTime: false,
    showServiceOptions: false,
    showAccessibility: true,
    tableRequired: true,
  },
  car_dealership: {
    showCuisine: false,
    showDeliveryTime: false,
    showServiceOptions: false,
    showAccessibility: false,
    tableRequired: false,
  },
};

const cuisineOptions = [
  { value: "Mediterranean", label: "Mediterranean" },
  { value: "Italian", label: "Italian" },
  { value: "Mexican", label: "Mexican" },
  { value: "Asian", label: "Asian" },
  { value: "American", label: "American" },
  { value: "French", label: "French" },
];

const BasicInfo = ({ onNext, editId, isEditMode, businessType }) => {
  const config = BUSINESS_CONFIG[businessType] || {};
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm({
    defaultValues: {
      businessName: "",
      cuisineType: "",
      description: "",
      phoneNumber: "",
      email: "",
      minDeliveryTime: "",
      maxDeliveryTime: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      countryCode: "",
      dineIn: false,
      delivery: false,
      pickup: false,
      enableReservations: false,
      wheelchairAccessible: false,
      parkingAvailable: false,
      tableRequired: config.tableRequired,
      slots:
        businessType === "restaurant"
          ? [{ tableSize: "", customCapacity: "", quantity: "" }]
          : [{ slotName: "chair", capacity: 1, quantity: "" }],
      staffFullName: "",
      staffEmail: "",
      staffPassword: "",
      staffPhoneNumber: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "slots" });
  const selectedCountry = watch("country");

  const selectCountry = (val) => {
    setValue("country", val);
    setValue("state", "");
  };
  const selectRegion = (val) => setValue("state", val);

  useEffect(() => {
    const fetchAvailableCountries = async () => {
      setIsLoadingData(true);
      try {
        const result = await restaurantService.getTwilioAvailableCountries();
        if (result.success) setAvailableCountries(result.data.countries || []);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchAvailableCountries();
  }, []);

  useEffect(() => {
    if (isEditMode && editId) {
      const load = async () => {
        setIsLoadingData(true);
        try {
          const result = await restaurantService.getRestaurantDetails(editId);
          if (result.success && result.data) {
            const data = result.data;
            const location = data.locations?.[0] || {};
            setValue("businessName", data.name || "");
            setValue("cuisineType", data.cuisine_type || "");
            setValue("description", data.description || "");
            setValue("phoneNumber", data.phone_number || "");
            setValue("email", data.email || "");
            setValue("minDeliveryTime", data.delivery_minimum || "");
            setValue("maxDeliveryTime", data.delivery_maximum || "");
            setValue("streetAddress", location.street_address || "");
            setValue("city", location.city || "");
            setValue("state", location.state || "");
            setValue("zipCode", location.zip_code || "");
            setValue("country", location.country || "United States");
            setValue("dineIn", location.is_dine_in_available || false);
            setValue("delivery", location.is_delivery_available || false);
            setValue("pickup", location.is_pickup_available || false);
            setValue(
              "wheelchairAccessible",
              location.is_wheelchair_accessible || false
            );
            setValue(
              "parkingAvailable",
              location.is_parking_available || false
            );
            setValue(
              "tableRequired",
              data.table_required ?? config.tableRequired
            );

            if (data.slots && data.slots.length) {
              setValue(
                "slots",
                data.slots.map((s) =>
                  businessType === "restaurant"
                    ? {
                        tableSize: s.capacity,
                        quantity: s.quantity,
                        customCapacity: s.capacity,
                      }
                    : { slotName: "chair", capacity: 1, quantity: s.quantity }
                )
              );
            }
          }
        } finally {
          setIsLoadingData(false);
        }
      };
      load();
    }
  }, [isEditMode, editId, setValue, config.tableRequired]);

  useEffect(() => {
    const selectedCountryData = availableCountries.find(
      (c) => c.country === selectedCountry
    );
    if (selectedCountryData) {
      setValue("countryCode", selectedCountryData.country_code);
    }
  }, [selectedCountry, availableCountries, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let slots = [];
      if (businessType === "restaurant") {
        slots = data.slots.map((s, index) => ({
          slot_name: `table${index + 1}`,
          slot_type: `table${index + 1}`,
          capacity:
            s.tableSize === "custom"
              ? Number(s.customCapacity)
              : Number(s.tableSize),
          quantity: Number(s.quantity),
        }));
      }
      if (businessType === "barber") {
        slots = [
          {
            slot_name: "chair",
            slot_type: "chair",
            capacity: 1,
            quantity: Number(data.slots[0].quantity),
          },
        ];
      }
      const payload = {
        name: data.businessName,
        email: data.email.trim().toLowerCase(),
        description: data.description,
        phone_number: data.phoneNumber,
        cuisine_type: config.showCuisine ? data.cuisineType : null,
        delivery_minimum: config.showDeliveryTime
          ? data.minDeliveryTime?.toString()
          : null,
        delivery_maximum: config.showDeliveryTime
          ? data.maxDeliveryTime?.toString()
          : null,
        business_type: businessType,
        country_code: data.countryCode,
        slots,
        chair_count:
          businessType === "barber" ? Number(data.slots[0].quantity) : 0,
        location: [
          {
            street_address: data.streetAddress,
            city: data.city,
            state: data.state,
            zip_code: data.zipCode,
            country: data.country,
            is_dine_in_available: config.showServiceOptions
              ? data.dineIn
              : false,
            is_delivery_available: config.showServiceOptions
              ? data.delivery
              : false,
            is_pickup_available: config.showServiceOptions
              ? data.pickup
              : false,
            is_wheelchair_accessible: config.showAccessibility
              ? data.wheelchairAccessible
              : false,
            is_parking_available: config.showAccessibility
              ? data.parkingAvailable
              : false,
          },
        ],
      };
      let result;
      if (isEditMode && editId) {
        result = await restaurantService.updateRestaurant(editId, payload);
        if (result.success) {
          localStorage.setItem("restaurant_id", result.restaurantId);
          onNext();
        }
      } else {
        result = await restaurantService.registerRestaurant(payload);
        if (result.success) {
          const businessId = result.restaurantId;
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
          console.error("Registration failed:", result.error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading data…</span>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Home className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? "Edit Business Info" : "Basic Info"}
        </h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TextField
              label="Business Name *"
              name="businessName"
              type="text"
              placeholder="Enter business name"
              icon={Home}
              error={errors.businessName?.message}
              {...register("businessName", {
                required: "Business name is required",
              })}
            />
            <TextField
              label="Contact Email *"
              name="email"
              type="email"
              placeholder="business@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register("email", { required: "Email is required" })}
            />
            <TextField
              label="Contact Number *"
              name="phoneNumber"
              type="tel"
              placeholder="1234567890"
              icon={Phone}
              error={errors.phoneNumber?.message}
              {...register("phoneNumber", { required: "Contact number is required" })}
            />
          </div>
          <TextAreaField
            label="Description *"
            name="description"
            placeholder="Enter description"
            rows={4}
            error={errors.description?.message}
            {...register("description", {
              required: "Description is required",
            })}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {config.showCuisine && (
              <SelectField
                label="Cuisine Type"
                name="cuisineType"
                value={watch("cuisineType")}
                options={cuisineOptions}
                placeholder="Select cuisine"
                error={errors.cuisineType?.message}
                required
                {...register("cuisineType")}
              />
            )}
            {config.showDeliveryTime && (
              <NumberField
                label="Min Delivery Time"
                name="minDeliveryTime"
                icon={Clock}
                error={errors.minDeliveryTime?.message}
                {...register("minDeliveryTime")}
              />
            )}
          </div>
          {config.showDeliveryTime && (
            <NumberField
              label="Max Delivery Time"
              name="maxDeliveryTime"
              icon={Clock}
              error={errors.maxDeliveryTime?.message}
              {...register("maxDeliveryTime")}
            />
          )}
          <div className="border-t pt-8 mt-8">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">
                Location Information
              </h3>
            </div>
            <TextField
              label="Street Address *"
              name="streetAddress"
              type="text"
              placeholder="123 Main Street"
              icon={MapPin}
              error={errors.streetAddress?.message}
              {...register("streetAddress", {
                required: "Street address is required",
              })}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <TextField
                label="City *"
                name="city"
                type="text"
                placeholder="Enter city"
                error={errors.city?.message}
                {...register("city", { required: "City is required" })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <RegionDropdown
                  country={selectedCountry}
                  value={watch("state")}
                  onChange={(val) => selectRegion(val)}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <input
                  type="hidden"
                  {...register("state", { required: "State is required" })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <TextField
                label="ZIP Code *"
                name="zipCode"
                type="text"
                placeholder="12345"
                error={errors.zipCode?.message}
                {...register("zipCode", { required: "ZIP code is required" })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => selectCountry(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.country ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Country</option>
                  {availableCountries.map((c) => (
                    <option key={c.country_code} value={c.country}>
                      {c.country}
                    </option>
                  ))}
                </select>
                <input
                  type="hidden"
                  {...register("country", { required: "Country is required" })}
                />
              </div>
              <TextField
                label="Country Code"
                name="countryCode"
                type="text"
                readOnly
                error={errors.countryCode?.message}
                {...register("countryCode")}
              />
            </div>
            {config.showServiceOptions && (
              <div className="space-y-4 mt-6">
                <h4 className="text-lg font-medium text-gray-900">
                  Service Options
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CheckboxField
                    label="Dine-in"
                    name="dineIn"
                    checked={watch("dineIn")}
                    onChange={(e) => setValue("dineIn", e.target.checked)}
                    {...register("dineIn")}
                  />
                  <CheckboxField
                    label="Delivery"
                    name="delivery"
                    checked={watch("delivery")}
                    onChange={(e) => setValue("delivery", e.target.checked)}
                    {...register("delivery")}
                  />
                  <CheckboxField
                    label="Pickup"
                    name="pickup"
                    checked={watch("pickup")}
                    onChange={(e) => setValue("pickup", e.target.checked)}
                    {...register("pickup")}
                  />
                </div>
              </div>
            )}
            {config.showAccessibility && (
              <div className="space-y-4 mt-6">
                <h4 className="text-lg font-medium text-gray-900">
                  Accessibility & Amenities
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CheckboxField
                    label="Wheelchair Accessible"
                    name="wheelchairAccessible"
                    checked={watch("wheelchairAccessible")}
                    onChange={(e) =>
                      setValue("wheelchairAccessible", e.target.checked)
                    }
                    {...register("wheelchairAccessible")}
                  />
                  <CheckboxField
                    label="Parking Available"
                    name="parkingAvailable"
                    checked={watch("parkingAvailable")}
                    onChange={(e) =>
                      setValue("parkingAvailable", e.target.checked)
                    }
                    {...register("parkingAvailable")}
                  />
                </div>
              </div>
            )}
          </div>

          <CheckboxField
            label="Enable Reservations"
            name="enableReservations"
            checked={watch("enableReservations")}
            onChange={(e) => setValue("enableReservations", e.target.checked)}
            {...register("enableReservations")}
          />

          {watch("enableReservations") && (
            <div className="border-t pt-8 mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reservation Slots
              </h3>
              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 items-end"
                >
                  <NumberField
                    label={!watch("tableRequired") ? "Reservation Slots":"Reservation Size"}
                    placeholder={!watch("tableRequired") ? "No. of Reservations":"Person Count"}
                    name={`slots[${index}].tableSize`}
                    {...register(`slots.${index}.tableSize`)}
                  />
                  {watch("tableRequired") && (
                    <NumberField
                      label="Quantity"
                      placeholder="Number of such reservations"
                      name={`slots[${index}].quantity`}
                      {...register(`slots.${index}.quantity`)}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 font-medium ml-2 border-border-red-500 border px-3 py-3 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  append({ tableSize: "", customCapacity: "", quantity: "" })
                }
                className="text-blue-600 font-medium mt-2 border border-blue-600 px-4 py-2 rounded-lg"
              >
                Add new reservation
              </button>
            </div>
          )}

          {!isEditMode && (
            <div className="border-t pt-8 mt-8">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Primary Staff Member
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
                  icon={Phone}
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
        </div>
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
              isLoading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating…" : "Creating…"}
              </>
            ) : (
              <>
                Next
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
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
