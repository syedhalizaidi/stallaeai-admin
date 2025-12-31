import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Home, Mail, Clock, Loader2, MapPin } from "lucide-react";
import { RegionDropdown } from "react-country-region-selector";
import TextField from "../TextField";
import SelectField from "../SelectField";
import { useToast } from "../../contexts/ToastContext";
import { BUSINESS_TYPES } from "../Restaurants";
import { restaurantService } from "../../services/restaurantService";
import { businessService } from "../../services/businessService";
import { userService } from "../../services/userService";
import { ROUTES } from "../../constants/routes";
import { User, Shield, Lock, Phone } from "lucide-react";

const GenericStep = ({ onClose }) => {
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await businessService.getBusinessCategories();
        if (result.success) {
          const formattedCategories = (result.data || []).map(cat => ({
            value: cat.key,
            label: cat.value.charAt(0).toUpperCase() + cat.value.slice(1).replace(/_/g, ' ')
          }));
          
          // Add 'Other' option if it doesn't exist
          if (!formattedCategories.some(c => c.value === 'other')) {
            formattedCategories.push({ value: 'other', label: 'Other' });
          }
          
          setCategories(formattedCategories);
        } else {
          showError("Failed to load business categories");
        }
      } catch {
        showError("Error loading business categories");
      }
    };
    fetchCategories();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      businessName: "",
      businessType: "",
      description: "",
      email: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      countryCode: "US",
      serviceAvailable: true,
      wheelchairAccessible: false,
      parkingAvailable: false,
      staffFullName: "",
      staffEmail: "",
      staffPassword: "",
      staffPhoneNumber: "",
    },
  });

  const selectedCountry = watch("country");
  const selectedBusinessType = watch("businessType");

  const selectCountry = (val) => {
    setValue("country", val, { shouldValidate: true });
    setValue("state", "");
    const selectedCountryData = availableCountries.find(
      (c) => c.country === val
    );
    if (selectedCountryData) {
      setValue("countryCode", selectedCountryData.country_code, {
        shouldValidate: true,
      });
    }
  };

  const selectRegion = (val) => {
    setValue("state", val, { shouldValidate: true });
  };

  const convertToSnakeCase = (str) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  useEffect(() => {
    const fetchAvailableCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const result = await restaurantService.getTwilioAvailableCountries();
        if (result.success) {
          setAvailableCountries(result.data.countries || []);
        } else {
          showError("Failed to load available countries");
        }
      } catch {
        showError("Error loading available countries");
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchAvailableCountries();
  }, []);

  useEffect(() => {
    if (selectedBusinessType === "other") {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
      setCustomCategory("");
    }
  }, [selectedBusinessType]);

  const onSubmit = async (data) => {
    if (data.businessType === "other" && !customCategory.trim()) {
      showError("Please enter a custom business category");
      return;
    }

    setIsLoading(true);
    try {
      let businessTypeToSend = data.businessType;
      if (data.businessType === "other" && customCategory.trim()) {
        businessTypeToSend = convertToSnakeCase(customCategory);
      }

      const payload = {
        name: data.businessName,
        email: data.email.trim().toLowerCase(),
        business_type: businessTypeToSend,
        country_code: data.countryCode,
        locations: [
          {
            street_address: data.streetAddress,
            city: data.city,
            state: data.state,
            zip_code: data.zipCode,
            country: data.country,
          },
        ],
      };

      const businessResult = await restaurantService.registerRestaurant(payload);

      if (businessResult.success) {
        const businessId = businessResult.restaurantId; // Fixed: was businessId
        localStorage.setItem("business_id", businessId);
        localStorage.setItem("restaurant_id", businessId);

        const staffPayload = {
          full_name: data.staffFullName,
          email: data.staffEmail,
          password: data.staffPassword,
          phone_number: data.staffPhoneNumber,
          role: "Proprietor",
          business_id: businessId,
          business_ids: [businessId], // Added plural for robustness
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

        onClose();
      } else {
        showError(businessResult.error);
      }
    } catch (error) {
      console.error("Business registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white !w-[50vw]">
      <div className="flex items-center mb-6 pb-4 border-b">
        <Home className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">{"Basic Info"}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TextField
              label="Business Name *"
              name="businessName"
              type="text"
              placeholder="Your Business Name"
              icon={Home}
              error={errors.businessName?.message}
              {...register("businessName", {
                required: "Business name is required",
              })}
            />

            <SelectField
              label="Business Category"
              name="businessType"
              value={watch("businessType")}
              options={categories}
              placeholder="Select Category"
              error={errors.businessType?.message}
              required
              {...register("businessType", {
                required: "Business category is required",
                validate: (v) =>
                  v !== "" || "Please select a business category",
              })}
            />
          </div>

          {showCustomCategory && (
            <div className="mt-6">
              <TextField
                label="Custom Business Category *"
                name="customCategory"
                type="text"
                placeholder="e.g., Hair Salon, Pet Store"
                icon={Home}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                error={showCustomCategory && !customCategory.trim() ? "Custom category is required" : ""}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TextField
              label="Contact Email *"
              name="email"
              type="email"
              placeholder="business@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Enter a valid email",
                },
              })}
            />
          </div>


          <div className="border-t pt-8">
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
                minLength: {
                  value: 5,
                  message: "Street address must be at least 5 characters",
                },
              })}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <TextField
                label="City *"
                name="city"
                type="text"
                placeholder="Enter city"
                error={errors.city?.message}
                {...register("city", {
                  required: "City is required",
                  minLength: {
                    value: 2,
                    message: "City must be at least 2 characters",
                  },
                })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <RegionDropdown
                  country={selectedCountry}
                  value={watch("state")}
                  onChange={(val) => selectRegion(val)}
                  className={`customSelect w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.state.message}
                  </p>
                )}
                <input
                  type="hidden"
                  {...register("state", { required: "State is required" })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <TextField
                label={
                  selectedCountry === "Canada" ? "Postal Code *" : "ZIP Code *"
                }
                name="zipCode"
                type="text"
                placeholder={selectedCountry === "Canada" ? "A1B-2C3" : "12345"}
                error={errors.zipCode?.message}
                {...register("zipCode", {
                  required:
                    selectedCountry === "Canada"
                      ? "Postal code is required"
                      : "ZIP code is required",
                  pattern: {
                    value:
                      selectedCountry === "Canada"
                        ? /^[A-Za-z]\d[A-Za-z]-\d[A-Za-z]\d$/
                        : /^\d{5}$/,
                    message:
                      selectedCountry === "Canada"
                        ? "Enter valid Postal Code"
                        : "Enter valid ZIP Code",
                  },
                })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => selectCountry(e.target.value)}
                  className={`customSelect w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.country ? "border-red-500" : "border-gray-300"
                  } "bg-gray-50 text-gray-500"`}
                  disabled={isLoadingCountries}
                >
                  {isLoadingCountries ? (
                    <option>Loading countries...</option>
                  ) : (
                    <>
                      <option value="">Select Country</option>
                      {availableCountries.map((country) => (
                        <option
                          key={country.country_code}
                          value={country.country}
                        >
                          {country.country}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.country.message}
                  </p>
                )}
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
                placeholder="US"
                error={errors.countryCode?.message}
                {...register("countryCode")}
              />
            </div>
          </div>

          <div className="border-t pt-8">
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
                  required: "Full name is required",
                })}
              />
              <TextField
                label="Email *"
                type="email"
                placeholder="Enter email address"
                icon={Mail}
                error={errors.staffEmail?.message}
                {...register("staffEmail", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Enter a valid email",
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
                  required: "Password is required",
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
                  required: "Phone number is required",
                  minLength: {
                    value: 8,
                    message: "Phone number must be at least 8 digits",
                  },
                })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {"Creating..."}
              </>
            ) : (
              <>
                Submit
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenericStep;
