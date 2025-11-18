import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Home, Mail, Clock, Loader2, MapPin } from "lucide-react";
import { RegionDropdown } from "react-country-region-selector";
import TextField from "../TextField";
import SelectField from "../SelectField";
import TimeField from "../TimeField";
import { businessService } from "../../services/businessService";
import { useToast } from "../../contexts/ToastContext";
import { BUSINESS_TYPES } from "../Restaurants";
import { restaurantService } from "../../services/restaurantService";

const GenericStep = ({ onClose }) => {
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

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
      openingTime: "",
      closingTime: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      countryCode: "US",
      serviceAvailable: true,
      wheelchairAccessible: false,
      parkingAvailable: false,
    },
  });

  const selectedCountry = watch("country");

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

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.businessName,
        email: data.email.trim().toLowerCase(),
        opening_time: data.openingTime,
        closing_time: data.closingTime,
        business_type: data.businessType,
        country_code: data.countryCode,
        location: [
          {
            street_address: data.streetAddress,
            city: data.city,
            state: data.state,
            zip_code: data.zipCode,
            country: data.country,
          },
        ],
      };

      const result = await restaurantService.registerRestaurant(payload);

      if (result.success) {
        localStorage.setItem("business_id", result.businessId);
        onClose();
      } else {
        showError(result.error);
      }
    } catch (error) {
      console.error("Business registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white !w-[70vw]">
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
              options={Object.entries(BUSINESS_TYPES).map(([key, label]) => ({
                value: key,
                label,
              }))}
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

            <TimeField
              label="Opening Time *"
              name="openingTime"
              icon={Clock}
              error={errors.openingTime?.message}
              {...register("openingTime", {
                required: "Opening time is required",
              })}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimeField
              label="Closing Time *"
              name="closingTime"
              icon={Clock}
              error={errors.closingTime?.message}
              {...register("closingTime", {
                required: "Closing time is required",
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
