import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Home, Mail, Clock, Loader2, MapPin, ArrowLeft } from "lucide-react";
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
import { businessService } from "../../services/businessService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import TimezoneSelect from "react-timezone-select";

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
  const [voices, setVoices] = useState([]);
  const [redirectCall, setRedirectCall] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [instanceName, setInstanceName] = useState("");
  const [instanceEmail, setInstanceEmail] = useState("");
  const [isInstanceLoading, setIsInstanceLoading] = useState(false);


  const navigate = useNavigate();

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
      reservations_enabled: false,
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
      openingMessage: "",
      redirect_call: false,
      voice_id: "",
      timezone: "",
      slotSizeMinutes: 30,
      weeklyScheduleType: "same",
      weekly_hours: {
        mon: { open: "09:00", close: "18:00", closed: false },
        tue: { open: "09:00", close: "18:00", closed: false },
        wed: { open: "09:00", close: "18:00", closed: false },
        thu: { open: "09:00", close: "18:00", closed: false },
        fri: { open: "09:00", close: "18:00", closed: false },
        sat: { open: "09:00", close: "18:00", closed: false },
        sun: { open: "09:00", close: "18:00", closed: false },
      }
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "slots" });
  const selectedCountry = watch("country");
  const watchVoiceId = watch("voice_id");
  // const isBarber = businessType === "barber";
  const tableRequired = watch("tableRequired");
  const enableReservations = watch("enableReservations");
  const scheduleType = watch("weeklyScheduleType");
  const [sameWeekHours, setSameWeekHours] = useState({ open: "09:00", close: "18:00", });
  const reservationEnabled = watch("reservations_enabled"); //for business hours
  const [initialReservationEnabled, setInitialReservationEnabled] = useState(false);
  const showAddInstance = enableReservations && tableRequired === false;



  // const showAddBarber = isBarber && enableReservations && tableRequired === false;
  const handleAddBarber = () => {
    if (!barberName || !barberEmail) {
      toast.error("Barber name and email are required");
      return;
    }

    setBarbers((prev) => [
      ...prev,
      {
        name: barberName,
        email: barberEmail,
      },
    ]);

    setBarberName("");
    setBarberEmail("");
  };

  const selectCountry = (val) => {
    setValue("country", val);
    setValue("state", "");
  };
  const selectRegion = (val) => setValue("state", val);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [countriesRes, voicesRes] = await Promise.all([
          restaurantService.getTwilioAvailableCountries(),
          businessService.getVoices()
        ]);

        if (countriesRes.success) setAvailableCountries(countriesRes.data.countries || []);

        if (voicesRes.success) {
          setVoices(voicesRes.data?.voices || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
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
            setValue("openingMessage", data.opening_message || "");
            setValue("redirect_call", data.redirect_call || false);
            setValue("timezone", data.timezone || "");
            setValue("slotSizeMinutes", data.slot_size_minutes || 30);
            setValue("weekly_hours", data.weekly_hours || {});
            setValue("reservations_enabled", data.reservations_enabled || false);
            setInitialReservationEnabled(data.reservations_enabled || false);


            setValue("voice_id", data.voice?.id || "");
            setRedirectCall(data.redirect_call || false);

            if (data.slots && data.slots.length) {
              const isTableRequired = data.table_required ?? config.tableRequired;
              setValue("enableReservations", true);
              setValue(
                "slots",
                data.slots.map((s) => {
                  if (isTableRequired) {
                    return {
                      tableSize: s.capacity,
                      quantity: s.quantity,
                      customCapacity: s.capacity,
                    };
                  } else {
                    return {
                      tableSize: s.quantity, // Mapped to "No. of Reservations" field
                      quantity: "",
                      customCapacity: "",
                    };
                  }
                })
              );
            } else {
              setValue("enableReservations", false);
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

  useEffect(() => {
    if (!isEditMode) return;

    const base = {
      open: sameWeekHours.open,
      close: sameWeekHours.close,
      closed: false,
    };

    if (scheduleType === "same") {
      setValue("weekly_hours", {
        mon: base,
        tue: base,
        wed: base,
        thu: base,
        fri: base,
        sat: base,
        sun: base,
      });
    }

    if (scheduleType === "weekends_off") {
      setValue("weekly_hours", {
        mon: base,
        tue: base,
        wed: base,
        thu: base,
        fri: base,
        sat: { open: "", close: "", closed: true },
        sun: { open: "", close: "", closed: true },
      });
    }
  }, [scheduleType, sameWeekHours, isEditMode, setValue]);

  useEffect(() => {
    if (!isEditMode) {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setValue("timezone", userTz);
    }
  }, []);
  const handleCreateInstance = async () => {
    if (!instanceName.trim() || !instanceEmail.trim()) {
      toast.error("Name and Email are required");
      return;
    }

    try {
      setIsInstanceLoading(true);

      const businessId =
        editId ||
        localStorage.getItem("business_id") ||
        localStorage.getItem("restaurant_id");

      if (!businessId) {
        toast.error("Business ID not found");
        return;
      }

      const createRes = await businessService.createInstance(
        businessId,
        {
          name: instanceName.trim(),
          email: instanceEmail.trim().toLowerCase(),
        }
      );

      const instanceId = createRes?.data?.id;

      if (!instanceId) {
        toast.error("Failed to create instance");
        return;
      }

      const calendlyRes =
        await businessService.instanceCalendlyLink(instanceId);

      const redirectUrl = calendlyRes?.data?.data?.url;

      if (!redirectUrl) {
        toast.error("Failed to get Calendly link");
        return;
      }

      window.location.assign(redirectUrl);

    } catch (error) {
      console.error("Instance creation error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsInstanceLoading(false);
    }
  };



  const onSubmit = async (data, e) => {
    setIsLoading(true);
    const isNextAction = e?.nativeEvent?.submitter?.innerText.includes("Next");
    try {
      let slots = [];
      if (data.enableReservations) {
        slots = data.slots.map((s, index) => {
          if (data.tableRequired) {
            return {
              slot_name: s.slotName || (businessType === "restaurant" ? `table${index + 1}` : `slot${index + 1}`),
              slot_type: s.slotName || (businessType === "restaurant" ? `table${index + 1}` : `slot${index + 1}`),
              capacity: s.tableSize === "custom"
                ? Number(s.customCapacity)
                : Number(s.tableSize),
              quantity: Number(s.quantity),
            };
          } else {
            return {
              slot_name: s.slotName || `slot${index + 1}`,
              slot_type: s.slotName || `slot${index + 1}`,
              capacity: 1,
              quantity: Number(s.tableSize), // Labeled "No. of Reservations" in UI when tableRequired is false
            };
          }
        });
      }
      if (data.reservations_enabled) {
        if (!data.timezone) {
          setIsLoading(false);
          return;
        }
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
          (businessType === "barber" && data.enableReservations) ? Number(data.slots[0]?.quantity || 0) : 0,
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
        opening_message: data.openingMessage || undefined,
        redirect_call: data.redirect_call,
        timezone: data.timezone,
        slot_size_minutes: Number(data.slotSizeMinutes),
        weekly_hours: data.weekly_hours,
        reservations_enabled: data.reservations_enabled,
      };
      if (!data.reservations_enabled) {
        // Remove business hour fields
        delete payload.weekly_hours;
        delete payload.timezone;
        delete payload.slot_size_minutes;
      } else {
        // Validate required fields
        if (!data.timezone) {
          toast.error("Timezone is required");
          setIsLoading(false);
          return;
        }
      }
      let result;
      if (isEditMode && editId) {
        result = await restaurantService.updateRestaurant(editId, payload);
        if (result.success) {
          // If voice changed, update it separately
          if (data.voice_id) {
            const selectedVoiceData = voices.find(v => (v.id || v.voice_id) === data.voice_id);
            if (selectedVoiceData) {
              await businessService.updateVoice(editId, {
                name: selectedVoiceData.name,
                category: selectedVoiceData.category,
                gender: selectedVoiceData.gender,
                preview_url: selectedVoiceData.preview_url,
                business_id: editId,
                id: data.voice_id,
              });
            }
          }
          localStorage.setItem("restaurant_id", result.restaurantId);
          const shouldConnectCalendly = isEditMode && !initialReservationEnabled && data.reservations_enabled === true;

          if (shouldConnectCalendly) {
            setIsLoading(true);

            const calendlyResponse =
              await businessService.businessCalendlyLink(editId);

            if (
              calendlyResponse.success &&
              calendlyResponse.data?.data?.url
            ) {
              window.location.assign(calendlyResponse.data.data.url);
              return;
            }
          }

          if (isNextAction) {
            onNext();
          } else {
            toast.success("Business Details Saved Successfully!");
          }
        }
      } else {
        result = await restaurantService.registerRestaurant(payload);
        if (result.success) {
          const businessId = result.restaurantId;
          localStorage.setItem("restaurant_id", businessId);
          localStorage.setItem("business_id", businessId);

          // If voice selected, create it
          if (data.voice_id) {
            const selectedVoiceData = voices.find(v => (v.id || v.voice_id) === data.voice_id);
            if (selectedVoiceData) {
              await businessService.createVoice({
                name: selectedVoiceData.name,
                category: selectedVoiceData.category,
                gender: selectedVoiceData.gender,
                preview_url: selectedVoiceData.preview_url,
                business_id: businessId,
                id: data.voice_id,
              });
            }
          }

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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Home className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              {isEditMode ? "Edit Business Info" : "Basic Info"}
            </h2>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-sm ${
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
                {isEditMode ? "Save" : "Next"}
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

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
             <h3 className="text-lg font-bold text-gray-900">AI & Voice Settings</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                   <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-gray-700">AI Answering Mode</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Only AI</span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = !watch("redirect_call");
                            setValue("redirect_call", current);
                            setRedirectCall(current);
                          }}
                          className={`relative cursor-pointer inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                             watch("redirect_call") ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            watch("redirect_call") ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                        <span className="text-xs font-medium text-gray-500">Redirect</span>
                      </div>
                   </div>
                   <p className="text-xs text-gray-500">Choose if calls should be handled solely by AI or redirected if needed.</p>
                   <input type="hidden" {...register("redirect_call")} />
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200">
                   <label className="text-sm font-bold text-gray-700 block mb-2">AI Voice</label>
                   <select
                      {...register("voice_id")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                      <option value="">Select AI Voice</option>
                      {voices.map(voice => (
                        <option key={voice.id || voice.voice_id} value={voice.id || voice.voice_id}>
                          {voice.name} ({voice.gender})
                        </option>
                      ))}
                   </select>
                   <p className="text-xs text-gray-500 mt-2">Select the voice your AI agent will use during calls.</p>
                </div>
             </div>
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
          <TextAreaField
            label="Greeting Message"
            name="openingMessage"
            placeholder="Enter a greeting message"
            rows={3}
            error={errors.openingMessage?.message}
            {...register("openingMessage")}
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
            onChange={(e) => {
              const checked = e.target.checked;
              setValue("enableReservations", checked);
              if (!checked) {
                // Reset slots to initial state when disabled
                const initialSlots = businessType === "restaurant"
                  ? [{ tableSize: "", customCapacity: "", quantity: "" }]
                  : [{ slotName: "chair", capacity: 1, quantity: "" }];
                setValue("slots", initialSlots);
              }
            }}
            {...register("enableReservations")}
          />

          {enableReservations && (
            <div className="border-t pt-8 mt-8">
              {/* CASE 1: Barber + tableRequired = false → Add Barber */}
              {showAddInstance ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Add {businessType}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <TextField
                      label={`${businessType} Name`}
                      placeholder={`Enter ${businessType} name`}
                      value={instanceName}
                      onChange={(e) => setInstanceName(e.target.value)}
                    />

                    <TextField
                      label="Email Address"
                      type="email"
                      placeholder="user@email.com"
                      value={instanceEmail}
                      onChange={(e) => setInstanceEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateInstance}
                    disabled={isInstanceLoading}
                    className={`px-5 py-2 rounded-lg font-medium flex items-center ${isInstanceLoading
                        ? "bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                  >
                    {isInstanceLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      `Add ${businessType}`
                    )}
                  </button>
                </>
              ) : (
                /* CASE 2: Everything else → existing reservation logic */
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Reservation Slots
                  </h3>
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 items-end"
                    >
                      <NumberField
                        label={!tableRequired ? "Reservation Slots" : "Reservation Size"}
                        placeholder={!tableRequired ? "No. of Reservations" : "Person Count"}
                        {...register(`slots.${index}.tableSize`, {
                          required: "Required",
                        })}
                      />

                      {tableRequired && (
                        <NumberField
                          label="Quantity"
                          placeholder="Number of such reservations"
                          {...register(`slots.${index}.quantity`, {
                            required: "Required",
                          })}
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="border px-3 py-3 rounded-lg text-red-500 border-red-500 hover:bg-red-50"
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
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <input
              type="checkbox"
              {...register("reservations_enabled")}
              className="h-4 w-4"
            />
            <label className="text-sm font-medium">
              Enable Reservation System
            </label>
          </div>

          {isEditMode && reservationEnabled && (

            <div className="border-t pt-8 mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Business Hours & Booking Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Timezone *
                  </label>

                  <TimezoneSelect
                    value={watch("timezone")}
                    onChange={(tz) => setValue("timezone", tz.value)}
                  />
                </div>


                {/* Slot Size */}
                <NumberField
                  label="Slot Size (Minutes)"
                  {...register("slotSizeMinutes", { required: true })}
                />

              </div>

              {/* Schedule Type */}
              <div className="mt-6">
                <SelectField
                  label="Schedule Type"
                  name="weeklyScheduleType"
                  value={scheduleType}
                  options={[
                    { value: "same", label: "Same throughout week" },
                    { value: "weekends_off", label: "Off on weekends" },
                    { value: "custom", label: "Custom" },
                  ]}
                  {...register("weeklyScheduleType")}
                />
              </div>
              {/* Same Throughout Week Editor */}
              {scheduleType === "same" && (
                <div className="grid grid-cols-3 gap-4 items-end mt-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      From
                    </label>
                    <input
                      type="time"
                      value={sameWeekHours.open}
                      onChange={(e) =>
                        setSameWeekHours((prev) => ({
                          ...prev,
                          open: e.target.value,
                        }))
                      }
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      To
                    </label>
                    <input
                      type="time"
                      value={sameWeekHours.close}
                      onChange={(e) =>
                        setSameWeekHours((prev) => ({
                          ...prev,
                          close: e.target.value,
                        }))
                      }
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                </div>
              )}


              {/* Custom Editor */}
              {scheduleType === "custom" && (
                <div className="space-y-4 mt-6">
                  {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                    <div key={day} className="grid grid-cols-4 gap-4 items-center">

                      <span className="capitalize font-medium">{day}</span>

                      <input
                        type="time"
                        {...register(`weekly_hours.${day}.open`)}
                        disabled={watch(`weekly_hours.${day}.closed`)}
                        className="border rounded px-3 py-2"
                      />

                      <input
                        type="time"
                        {...register(`weekly_hours.${day}.close`)}
                        disabled={watch(`weekly_hours.${day}.closed`)}
                        className="border rounded px-3 py-2"
                      />

                      <CheckboxField
                        label="Closed"
                        checked={watch(`weekly_hours.${day}.closed`)}
                        onChange={(e) =>
                          setValue(`weekly_hours.${day}.closed`, e.target.checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
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
        <div className="flex flex-col md:flex-row justify-between items-center mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className=" flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Back to Dashboard</span>
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${isLoading
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
