import { useEffect, useState } from "react";
import { Store, MapPin, Loader2, User, ChevronDown } from "lucide-react";
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

  const fetchStats = async () => {
    const result = await dashboardService.getDashboardStats();
    if (result.success) {
      setStats(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const fetchBusinesses = async () => {
    const result = await restaurantService.getRestaurants();
    if (result.success) {
      setRestaurants(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchBusinesses();
  }, []);

  const handleSelectBusiness = (business) => {
    setSelectedBusiness(business);
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
            onClick={() => {
              setLoading(true);
              fetchStats();
              fetchBusinesses();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const statCards = [
    {
      title: "Total Restaurants",
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

  console.log({ selectedBusiness });

  return (
    <div>
      {/* Header */}
      <div className="flex sm:flex-row flex-col justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your restaurant management dashboard
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

      {/* Business List Dropdown */}
      <div className="relative w-full">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex justify-between items-center w-full bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <span className="font-medium text-gray-800">
            {selectedBusiness
              ? selectedBusiness.name ||
              selectedBusiness.business_name ||
              "Unnamed Business"
              : `Business List (${restaurants.length})`}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fadeIn">
            {restaurants.length > 0 ? (
              restaurants.map((biz, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectBusiness(biz)}
                  className="px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition-colors"
                >
                  {biz.name || biz.business_name || `Business ${idx + 1}`}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                No businesses found.
              </div>
            )}
          </div>
        )}
      </div>

      {selectedBusiness && <RestaurantDashboard restaurant={selectedBusiness} />}

    </div>
  );
};

export default DashboardModule;
