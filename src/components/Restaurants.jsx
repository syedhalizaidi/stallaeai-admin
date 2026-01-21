import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Phone,
  Plus,
  Loader2,
  ChevronRight,
  SquarePen,
  Trash2,
  BriefcaseBusiness,
  Globe,
  MessageSquare,
  Star,
  MapPin,
  Info,
  CheckCircle2,
  XCircle,
  Table2,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { restaurantService } from "../services/restaurantService";
import { businessService } from "../services/businessService";
import Users from "./Users";
import DeleteBusinessModal from "./DeleteBusinessModal";
import VoiceControl from "../pages/VoicePage";
import GenericStep from "./RestaurantSetup/GenericStep";
import BusinessSelector from "./BusinessSelector";
import { useBusinessContext } from "../contexts/BusinessContext";
import { updateAiAnsweringMode } from "../services/restaurantDashboardService";
import { useToast } from "../contexts/ToastContext";

export const BUSINESS_TYPES = {
  restaurant: "Restaurant",
  car_dealership: "Car Dealership",
  barber: "Barber",
};

const RestaurantsModule = ({ initialBusiness }) => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    initialBusiness || null,
  );
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [businessType, setBusinessType] = useState(null);
  const [editBusinessId, setEditBusinessId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const userRole = localStorage.getItem("userRole")?.replace(/"/g, "");
  const { selectedBusiness, refreshBusinesses: refreshContextBusinesses } =
    useBusinessContext();
  const { showSuccess, showError } = useToast();
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);

  useEffect(() => {
    if (initialBusiness && !selectedRestaurant) {
      setSelectedRestaurant(initialBusiness);
    }
  }, [initialBusiness]);

  const handleToggleAiMode = async (business, currentRedirectCall) => {
    setIsUpdatingMode(true);
    const newStatus = !currentRedirectCall;
    const res = await updateAiAnsweringMode(business.id, newStatus);
    if (res.success) {
      showSuccess(`Mode updated to ${newStatus ? "Redirect" : "Only"}`);
      fetchBusinesses();
      if (selectedBusiness?.id === business.id) {
        refreshContextBusinesses();
      }
      if (selectedRestaurant?.id === business.id) {
        setSelectedRestaurant((prev) =>
          prev ? { ...prev, redirect_call: newStatus } : null,
        );
      }
    } else {
      showError(res.message);
    }
    setIsUpdatingMode(false);
  };

  const fetchBusinesses = async () => {
    const result = await restaurantService.getRestaurants();
    if (result.success) {
      setRestaurants(result.data);
      setLoading(false);
      setError(null);
      // Update selected restaurant if it's in the list to get fresh data
      if (selectedRestaurant) {
        const updated = result.data.find((r) => r.id === selectedRestaurant.id);
        if (updated) setSelectedRestaurant(updated);
      }
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const fetchVoices = async () => {
    const result = await businessService.getVoices();
    if (result.success) {
      setVoices(result.data?.voices || []);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setActiveTab("details");
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
  };

  const handleAddRestaurant = () => {
    setIsAddBusinessModalOpen(true);
  };

  const handleDeleteClick = (restaurant) => {
    setBusinessToDelete(restaurant);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!businessToDelete) return;
    setIsDeleting(true);
    try {
      const result = await restaurantService.deleteRestaurant(
        businessToDelete.id,
      );
      if (result.success) {
        fetchBusinesses();
        setIsDeleteModalOpen(false);
        setBusinessToDelete(null);
        if (selectedRestaurant?.id === businessToDelete.id) {
          setSelectedRestaurant(null);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setBusinessToDelete(null);
  };

  const handleEditBusiness = (businessType, businessId) => {
    setBusinessType(businessType);
    setEditBusinessId(businessId);
    setIsEditMode(true);
  };

  const handleCloseEdit = () => {
    setIsEditMode(false);
    setBusinessType(null);
  };

  const handleEditSuccess = () => {
    setIsEditMode(false);
    setBusinessType(null);
    fetchBusinesses();
  };

  const renderBusinessForm = () => {
    if (!businessType) return null;
    const commonProps = {
      onNext: handleEditSuccess,
      editId: editBusinessId,
      isEditMode: true,
    };

    navigate(
      `/setup?step=basic-info&editId=${editBusinessId}&businessType=${businessType}`,
    );
  };

  useEffect(() => {
    fetchBusinesses();
    fetchVoices();
  }, [isAddBusinessModalOpen]);

  return (
    <div className="p-4 sm:p-6">
      {/* Breadcrumb / Header */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-2 sm:mb-0">
          <nav className="flex flex-wrap items-center space-x-2 text-sm">
            {selectedRestaurant ? (
              <>
                <span
                  className="text-gray-500 font-medium cursor-pointer hover:text-purple-600"
                  onClick={handleBackToRestaurants}
                >
                  Business
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500 font-medium">
                  {selectedRestaurant.name}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-purple-600 font-medium capitalize">
                  {activeTab}
                </span>
              </>
            ) : (
              <span className="text-purple-600 font-medium">Business</span>
            )}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-2 sm:mt-0">
          {selectedRestaurant && (
            <button
              onClick={handleBackToRestaurants}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center transition-colors cursor-pointer"
            >
              <BriefcaseBusiness className="h-5 w-5 mr-2 text-purple-600" />{" "}
              Business Listing
            </button>
          )}
          <button
            onClick={handleAddRestaurant}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center transition-colors cursor-pointer"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Business
          </button>
        </div>
      </div>

      {/* Tabs for selected restaurant */}
      {selectedRestaurant && (
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "details"
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Details
            {activeTab === "details" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "users"
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Users
            {activeTab === "users" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
        </div>
      )}

      {/* Conditional rendering */}
      {selectedRestaurant ? (
        activeTab === "users" ? (
          <Users
            restaurantId={selectedRestaurant.id}
            restaurantName={selectedRestaurant.name}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                  {selectedRestaurant.logo ? (
                    <img
                      src={selectedRestaurant.logo}
                      alt={selectedRestaurant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-8 w-8 text-purple-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedRestaurant.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
                      {BUSINESS_TYPES[
                        selectedRestaurant.business_type?.toLowerCase()
                      ] || selectedRestaurant.business_type}
                    </p>
                    {selectedRestaurant.rating !== null && (
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold">
                        <Star className="h-3 w-3 fill-yellow-700" />
                        {selectedRestaurant.rating} (
                        {selectedRestaurant.review_count} reviews)
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  handleEditBusiness(
                    selectedRestaurant.business_type,
                    selectedRestaurant.id,
                  )
                }
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium border border-purple-100"
              >
                <SquarePen className="h-4 w-4" />
                Edit Business
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    Contact Information
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Twilio Number</p>
                        <p className="font-medium">
                          {selectedRestaurant.twilio_number?.phone_number ||
                            "Not Assigned"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Business Phone</p>
                        <p className="font-medium">
                          {selectedRestaurant.phone_number || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                        <Plus className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">Email Address</p>
                        <p className="font-medium truncate">
                          {selectedRestaurant.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    {selectedRestaurant.website && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Globe className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500">Website</p>
                          <a
                            href={
                              selectedRestaurant.website.startsWith("http")
                                ? selectedRestaurant.website
                                : `https://${selectedRestaurant.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-purple-600 hover:text-purple-700 truncate block"
                          >
                            {selectedRestaurant.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    Locations
                  </label>
                  <div className="space-y-4">
                    {selectedRestaurant.locations?.map((loc, idx) => (
                      <div
                        key={loc.id || idx}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {loc.street_address}
                            <br />
                            {loc.city}, {loc.state} {loc.zip_code}
                            <br />
                            {loc.country}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                          {[
                            { label: "Dine-in", val: loc.is_dine_in_available },
                            {
                              label: "Delivery",
                              val: loc.is_delivery_available,
                            },
                            { label: "Pickup", val: loc.is_pickup_available },
                            {
                              label: "Wheelchair",
                              val: loc.is_wheelchair_accessible,
                            },
                            { label: "Parking", val: loc.is_parking_available },
                          ]
                            .filter((feat) => feat.val)
                            .map((feat, fidx) => (
                              <div
                                key={fidx}
                                className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-md"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-[10px] font-medium text-green-700">
                                  {feat.label}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    Settings
                  </label>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          AI Answering Mode
                        </p>
                        <p className="text-xs text-gray-500">
                          Toggle between AI-only and redirect mode
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">
                          Only AI
                        </span>
                        <button
                          onClick={() =>
                            handleToggleAiMode(
                              selectedRestaurant,
                              !!selectedRestaurant.redirect_call,
                            )
                          }
                          disabled={isUpdatingMode}
                          className={`relative cursor-pointer inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            selectedRestaurant.redirect_call
                              ? "bg-purple-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              selectedRestaurant.redirect_call
                                ? "translate-x-5"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span className="text-xs font-medium text-gray-500">
                          Redirect
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-900 mb-2">
                        Voice Configuration
                      </p>
                      <VoiceControl
                        voice={selectedRestaurant.voice}
                        businessId={selectedRestaurant.id}
                        voices={voices}
                        onVoiceUpdated={fetchBusinesses}
                      />
                    </div>
                  </div>
                </div>

                {selectedRestaurant.opening_message && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Opening Message
                    </label>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 relative">
                      <MessageSquare className="h-4 w-4 text-purple-300 absolute top-3 right-3" />
                      <p className="text-sm text-purple-900 leading-relaxed">
                        {selectedRestaurant.opening_message}
                      </p>
                    </div>
                  </div>
                )}

                {selectedRestaurant.description && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Description
                    </label>
                    <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-purple-200 pl-4">
                      "{selectedRestaurant.description}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Extra Sections */}
            <div className="px-8 pb-8 space-y-8">
              {selectedRestaurant.slots?.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                    Service Slots / Tables
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedRestaurant.slots.map((slot, idx) => {
                      const lowerName = slot.slot_name?.toLowerCase() || "";
                      let displayName = slot.slot_name;
                      let showCapacity = true;

                      if (lowerName.startsWith("slot")) {
                        displayName = "Chair";
                        showCapacity = false;
                      } else if (lowerName.startsWith("table")) {
                        displayName = "Table";
                      }

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
                        >
                          <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <Table2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-none mb-1">
                              {displayName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {showCapacity && `Capacity: ${slot.capacity} | `}
                              Qty: {slot.quantity}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedRestaurant.faq_data && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      FAQ Data
                    </label>
                    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                      <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-bold text-gray-900">
                          Recent FAQs
                        </span>
                      </div>
                      <div className="p-4">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans">
                          {typeof selectedRestaurant.faq_data === "string"
                            ? selectedRestaurant.faq_data
                            : JSON.stringify(
                                selectedRestaurant.faq_data,
                                null,
                                2,
                              )}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRestaurant.knowledge_base && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      Knowledge Base
                    </label>
                    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                      <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-bold text-gray-900">
                          Source Content
                        </span>
                      </div>
                      <div className="p-4">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans">
                          {typeof selectedRestaurant.knowledge_base === "string"
                            ? selectedRestaurant.knowledge_base
                            : JSON.stringify(
                                selectedRestaurant.knowledge_base,
                                null,
                                2,
                              )}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading Businesses...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="text-center">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Businesses
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchBusinesses}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : restaurants?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Businesses Found
          </h3>
          {userRole !== "Staff" && (
            <>
              <p className="text-gray-600 mb-4">
                You haven't added any businesses yet. Get started by adding your
                first Business.
              </p>
              <button
                onClick={handleAddRestaurant}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center transition-colors mx-auto"
              >
                <Plus className="h-5 w-5 mr-2" /> Add Your First Business
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Businesses List
            </h3>
            <p className="text-sm text-gray-600">
              View and manage all your businesses
            </p>
          </div>

          {/* Mobile list (stacked cards) */}
          <div className="sm:hidden">
            <div className="divide-y divide-gray-200">
              {restaurants?.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="p-3 flex items-start justify-between gap-2 hover:bg-gray-50 cursor-pointer relative"
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 overflow-hidden flex-shrink-0">
                      {restaurant?.logo ? (
                        <img
                          src={restaurant.logo}
                          alt={restaurant.name || "Business"}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Store className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="min-w-0 max-w-[150px]">
                      <div className="text-sm font-medium text-gray-900">
                        {restaurant?.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="">
                          {restaurant?.twilio_number?.phone_number || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 min-w-0">
                    <div className="px-3 py-1">
                      <div className="flex items-center">
                        <BriefcaseBusiness className="h-5 w-5 text-gray-400 mr-2 sm:mr-3" />
                        <div className="text-sm text-gray-900">
                          {BUSINESS_TYPES[
                            restaurant?.business_type?.toLowerCase()
                          ] ||
                            (restaurant?.business_type
                              ? restaurant.business_type
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1),
                                  )
                                  .join(" ")
                              : "N/A")}
                        </div>
                      </div>
                    </div>

                    {/* three-dots menu */}
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === restaurant.id ? null : restaurant.id,
                          );
                        }}
                        aria-haspopup="true"
                        aria-expanded={openMenuId === restaurant.id}
                        className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                      >
                        {/* simple ellipsis */}
                        <span className="text-lg leading-none">⋯</span>
                      </button>

                      {openMenuId === restaurant.id && (
                        <div
                          className="absolute right-3 top-10 bg-white border border-gray-200 rounded shadow-lg w-48 z-50 p-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                          >
                            ✕
                          </button>

                          <div className="w-full px-2 py-1 mt-4">
                            <div className="text-xs text-gray-500 mb-1">
                              Voice
                            </div>
                            <div className="w-full">
                              <VoiceControl
                                voice={restaurant.voice}
                                businessId={restaurant.id}
                                voices={voices}
                                onVoiceUpdated={() => {
                                  fetchBusinesses();
                                  setOpenMenuId(null);
                                }}
                              />
                            </div>
                          </div>

                          <div className="border-t border-gray-100 p-2">
                            Number:{" "}
                            {restaurant?.twilio_number?.phone_number || ""}
                          </div>

                          {(userRole === "Admin" ||
                            userRole === "Proprietor") && (
                            <div className="border-t border-gray-100 p-2 flex items-center justify-between">
                              Action:
                              <SquarePen
                                className="h-5 w-5 text-purple-600 mr-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditBusiness(
                                    restaurant?.business_type,
                                    restaurant.id,
                                  );
                                }}
                              />
                              <Trash2
                                className="h-5 w-5 text-red-500 mr-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(restaurant);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voice
                  </th>
                  <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Type
                  </th>
                  {(userRole === "Admin" || userRole === "Proprietor") && (
                    <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurants?.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-2 whitespace-nowrap">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleRestaurantClick(restaurant)}
                      >
                        <div className="h-10 w-10 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          {restaurant?.logo ? (
                            <img
                              src={restaurant.logo}
                              alt={restaurant.name || "Business"}
                              className="h-full w-full rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <Store
                            className="h-5 w-5 text-purple-600"
                            style={{
                              display: restaurant?.logo ? "none" : "flex",
                            }}
                          />
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant?.name || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 whitespace-nowrap content-start flex">
                      <VoiceControl
                        voice={restaurant.voice}
                        businessId={restaurant.id}
                        voices={voices}
                        onVoiceUpdated={fetchBusinesses}
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-2 sm:mr-3" />
                        <div className="text-sm text-gray-900">
                          {restaurant?.twilio_number?.phone_number || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <BriefcaseBusiness className="h-5 w-5 text-gray-400 mr-2 sm:mr-3" />
                        <div className="text-sm text-gray-900">
                          {BUSINESS_TYPES[
                            restaurant?.business_type?.toLowerCase()
                          ] ||
                            (restaurant?.business_type
                              ? restaurant.business_type
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1),
                                  )
                                  .join(" ")
                              : "N/A")}
                        </div>
                      </div>
                    </td>

                    {(userRole === "Admin" || userRole === "Proprietor") && (
                      <td className="px-3 sm:px-6 py-2 flex justify-center items-center gap-2 whitespace-nowrap text-sm font-medium h-[72px]">
                        <SquarePen
                          className="h-5 w-5 text-purple-600 mr-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBusiness(
                              restaurant?.business_type,
                              restaurant.id,
                            );
                          }}
                        />
                        <Trash2
                          className="h-5 w-5 text-red-500 mr-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(restaurant);
                          }}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddBusinessModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity flex items-center justify-center z-50 p-4">
          <GenericStep onClose={() => setIsAddBusinessModalOpen(false)} />
        </div>
      )}

      {isEditMode && businessType && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              {renderBusinessForm()}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCloseEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteBusinessModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        businessName={businessToDelete?.name || "this business"}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RestaurantsModule;
