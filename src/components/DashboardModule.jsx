import { useEffect, useState } from "react";
import { Store, MapPin, Loader2, User, ChevronDown, Search } from "lucide-react";
import { dashboardService } from "../services/dashboard";
import { restaurantService } from "../services/restaurantService";
import RestaurantDashboard from "./CardCon";

const DashboardModule = () => {
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsResult, businessesResult] = await Promise.all([
        dashboardService.getDashboardStats(),
        restaurantService.getRestaurants(),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        setError(statsResult.error);
      }

      if (businessesResult.success) {
        setRestaurants(businessesResult.data);
        const savedId = localStorage.getItem("businessId");
        let businessToSelect = null;

        if (savedId) {
          businessToSelect = businessesResult.data.find(
            (biz) => biz.id === savedId
          );
        }

        if (!businessToSelect && businessesResult.data.length > 0) {
          businessToSelect = businessesResult.data[0];
        }

        setSelectedBusiness(businessToSelect);

        if (businessToSelect) {
          localStorage.setItem("businessId", businessToSelect.id);
        }
      } else {
        setError(businessesResult.error);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectBusiness = (business) => {
    setSelectedBusiness(business);
     localStorage.setItem("businessId", business.id);
    setDropdownOpen(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const statCards = [
    {
      title: "Total Business",
      value: stats?.total_business,
      icon: Store,
      gradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      glow: "shadow-blue-100",
    },
    {
      title: "Active Locations",
      value: stats?.open_now,
      icon: MapPin,
      gradient: "from-green-50 to-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      glow: "shadow-green-100",
    },
    {
      title: "Inactive Locations",
      value: stats?.closed_now,
      icon: MapPin,
      gradient: "from-red-50 to-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      glow: "shadow-red-100",
    },
    {
      title: "Total Users",
      value: stats?.total_user,
      icon: User,
      gradient: "from-yellow-50 to-yellow-100",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      glow: "shadow-yellow-100",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex sm:flex-row flex-col justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your business management dashboard
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.gradient} p-5 sm:p-6 rounded-xl border border-gray-200 
              shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center">
                <div
                  className={`h-12 w-12 sm:h-14 sm:w-14 ${card.iconBg} rounded-xl flex items-center justify-center ${card.glow}`}
                >
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${card.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value ?? "-"}
                  </p>
                </div>
              </div>
              <div className="mt-4 w-full h-1 bg-gradient-to-r from-purple-200 via-gray-200 to-transparent rounded-full"></div>
            </div>
          );
        })}
      </div>

      {/* Search and Business Selection Layout */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search Field (60%) */}
        <div className="w-full md:w-[60%]">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-300"
              placeholder="Search orders, customers, phone numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="sr-only">Clear search</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Business List Dropdown (40%) */}
        <div className="w-full md:w-[40%] relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex justify-between items-center w-full bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center overflow-hidden">
              <Store className="h-5 w-5 text-gray-400 mr-3 group-hover:text-purple-500 transition-colors duration-200" />
              <span className="font-medium text-gray-700 truncate">
                {selectedBusiness
                  ? selectedBusiness.name ||
                    selectedBusiness.business_name ||
                    "Unnamed Business"
                  : `Business List (${restaurants.length})`}
              </span>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-purple-500" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute z-20 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fadeIn ring-1 ring-black ring-opacity-5">
              {restaurants.length > 0 ? (
                restaurants.map((biz, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectBusiness(biz)}
                    className="px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex items-center"
                  >
                    <div className="h-2 w-2 rounded-full bg-purple-400 mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {biz.name || biz.business_name || `Business ${idx + 1}`}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm text-center">
                  No businesses found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedBusiness && (
        <RestaurantDashboard restaurant={selectedBusiness} searchQuery={searchQuery} />
      )}
    </div>
  );
};

export default DashboardModule;
