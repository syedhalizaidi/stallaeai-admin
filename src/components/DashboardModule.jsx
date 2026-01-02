import { useEffect, useState } from "react";
import {
  Store,
  MapPin,
  Loader2,
  User,
  Search,
  FileStack,
  Menu as MenuIcon,
  UserPlus,
  Grid,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "../services/dashboard";
import RestaurantDashboard from "./CardCon";
import PageModal from "./PageModal";
import Restaurants from "./Restaurants";
import KnowledgePage from "../pages/KnowledgePage";
import ManageMenu from "../pages/ManageMenu";
import AddStaffPage from "../pages/AddStaffPage";
import BusinessSelector from "./BusinessSelector";
import { useBusinessContext } from "../contexts/BusinessContext";
import {
  getNote,
  createNote,
  deleteNote,
} from "../services/restaurantDashboardService";
import { useToast } from "../contexts/ToastContext";

const DashboardModule = () => {
  const navigate = useNavigate();
  const { selectedBusiness } = useBusinessContext();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [activePageModal, setActivePageModal] = useState(null);

  // Notes state
  const [businessNote, setBusinessNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsResult = await dashboardService.getDashboardStats();

      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        setError(statsResult.error);
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

  // Fetch notes when business changes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!selectedBusiness) return;

      try {
        const response = await getNote(selectedBusiness.id);
        if (response.success && response.data) {
          setBusinessNote(response.data.message || "");
        } else {
          setBusinessNote("");
        }
      } catch (err) {
        console.error("Error fetching notes:", err);
        setBusinessNote("");
      }
    };

    fetchNotes();
  }, [selectedBusiness]);

  const handleSubmitNote = async () => {
    if (!selectedBusiness) return;

    setNoteLoading(true);
    try {
      const payload = {
        business_id: selectedBusiness.id,
        message: businessNote,
      };
      const response = await createNote(payload);
      if (response.success) {
        showSuccess("Note saved successfully");
      } else {
        showError("Failed to save note: " + response.message);
      }
    } catch (error) {
      showError("Failed to save note");
    } finally {
      setNoteLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedBusiness) return;

    try {
      const response = await deleteNote(selectedBusiness.id);
      if (response.success) {
        showSuccess("Note deleted successfully");
        setBusinessNote("");
      } else {
        showError("Failed to delete note: " + response.message);
      }
    } catch (error) {
      showError("Failed to delete note");
    }
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

  /* Navigation Cards Data */
  const navigationCards = [
    {
      id: "business-details",
      label: "Business Details",
      description: "Manage locations & voice settings",
      icon: Store,
      modalKey: "business",
    },
    {
      id: "knowledge-base",
      label: "Knowledge Base",
      description: "Upload FAQs & training documents",
      icon: FileStack,
      modalKey: "knowledge",
    },
    {
      id: "menu-management",
      label: "Manage Menu",
      description: "Configure items, prices & categories",
      icon: MenuIcon,
      modalKey: "menu",
    },
    {
      id: "add-staff",
      label: "Add staff",
      description: "Add a new staff member",
      icon: UserPlus,
      modalKey: "staff",
    },
  ];

  return (
    <div>
      {/* Header & Business Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500">Manage your AI agent ecosystem.</p>
          </div>
        </div>

        {/* Business Selector */}
        <BusinessSelector />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col h-full justify-between">
                <div className="mb-4">
                  <Icon
                    className={`h-6 w-6 sm:h-7 sm:w-7 ${card.iconColor} mb-3`}
                  />
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {card.value ?? "0"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {navigationCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setActivePageModal(item.modalKey)}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="bg-[linear-gradient(135deg,_#557ebf_0%,_#667eea_100%)] w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {item.label}
              </h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        {/* Business Notes Section */}
        <div className="mb-8 p-6 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="flex items-center mb-4">
            <span className="font-bold text-gray-800 text-lg">
              Business Notes
            </span>
          </div>
          <textarea
            value={businessNote}
            onChange={(e) => setBusinessNote(e.target.value)}
            placeholder="Add notes about this business..."
            className="w-full p-4 border border-gray-200 bg-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-white"
            rows={4}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubmitNote}
              disabled={noteLoading || !selectedBusiness}
              className="px-4 py-2 bg-[linear-gradient(135deg,_#557ebf_0%,_#667eea_100%)] cursor-pointer text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {noteLoading ? "Saving..." : "Save Note"}
            </button>
            {businessNote && (
              <button
                onClick={handleDeleteNote}
                disabled={noteLoading || !selectedBusiness}
                className="px-4 py-2 bg-gray-200 cursor-pointer hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search Bar - Integrated nicely */}
        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-xl text-gray-900 placeholder-gray-400 focus:ring-0 shadow-sm"
            placeholder="Search orders, customers, phone numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {selectedBusiness && (
          <RestaurantDashboard
            restaurant={selectedBusiness}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Page Modals */}
      <PageModal
        isOpen={activePageModal === "business"}
        onClose={() => setActivePageModal(null)}
        title="Business Details"
      >
        <Restaurants />
      </PageModal>

      <PageModal
        isOpen={activePageModal === "knowledge"}
        onClose={() => setActivePageModal(null)}
        title="Knowledge Base"
      >
        <KnowledgePage />
      </PageModal>

      <PageModal
        isOpen={activePageModal === "menu"}
        onClose={() => setActivePageModal(null)}
        title="Manage Menu"
      >
        <ManageMenu />
      </PageModal>

      <PageModal
        isOpen={activePageModal === "staff"}
        onClose={() => setActivePageModal(null)}
        title="Add Staff"
      >
        <AddStaffPage />
      </PageModal>
    </div>
  );
};

export default DashboardModule;
