import { useEffect, useState, useRef } from "react";
import "react-calendar/dist/Calendar.css";
import {
  getOrders,
  getNote,
  createNote,
  deleteNote,
} from "../services/restaurantDashboardService";
import ReservationsCard from "./RestaurantDashboard/cards/reservations-card.jsx";
import ReservationsModal from "./RestaurantDashboard/modals/reservations-modal.jsx";
import RecentOrdersCard from "./RestaurantDashboard/cards/recent-orders-card.jsx";
import RecentOrdersModal from "./RestaurantDashboard/modals/recent-orders-modal.jsx";
import FAQsCard from "./RestaurantDashboard/cards/faqs-card.jsx";
import FAQsModal from "./RestaurantDashboard/modals/faqs-modal.jsx";
import CallbackCard from "./RestaurantDashboard/cards/callback-card.jsx";
import CallbackModal from "./RestaurantDashboard/modals/callback-modal.jsx";
import CustomerDetailsSidebar from "./RestaurantDashboard/CustomerDetailsSidebar.jsx";
import "./dashboard.css";
import { useToast } from "../contexts/ToastContext.jsx";

const RestaurantDashboard = ({ restaurant, searchQuery }) => {
  const { showSuccess, showError } = useToast();
  const [orderData, setOrderData] = useState([]);

  const [reservations, setReservations] = useState([]);
  const [activeModal, setActiveModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [readOrders, setReadOrders] = useState(new Set());

  const handleMarkAsRead = (phoneNumber) => {
    setReadOrders((prev) => {
      const newSet = new Set(prev);
      newSet.add(phoneNumber);
      return newSet;
    });
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown time";

    // Clean the timestamp if needed
    let cleanTimestamp = timestamp.replace("+00:00Z", "Z");
    const nowUtc = new Date().getTime();
    const orderUtc = new Date(cleanTimestamp).getTime();

    if (isNaN(orderUtc)) return "Invalid timestamp";

    const diffMs = nowUtc - orderUtc;
    if (diffMs < 0) return "Just now";

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minute(s) ago`;
    if (diffHours < 24) return `${diffHours} hour(s) ago`;
    return `${diffDays} day(s) ago`;
  };
  const [faqOrders, setFaqOrders] = useState([]);
  const [callbackOrders, setCallbackOrders] = useState([]);
  const prevRestaurantId = useRef(null);

  // Set loading state only when restaurant changes
  useEffect(() => {
    if (restaurant?.id && restaurant.id !== prevRestaurantId.current) {
      setIsLoading(true);
      prevRestaurantId.current = restaurant.id;
    }
  }, [restaurant?.id]);

  const fetchOrders = async () => {
    try {
      const res = restaurant;
      if (!res) return;

      const phone = res?.twilio_number?.phone_number;
      if (!phone) {
        console.warn("No Twilio number found for this restaurant");
        return;
      }

      const orderResponse = await getOrders({ twilio_phone_number: phone });
      if (!orderResponse.success) return;

      const allOrders = orderResponse.data?.data || [];

      const reservationOrders = [];
      const foodOrders = [];
      const faqOrders = [];
      const callbackOrders = [];

      allOrders.forEach((order) => {
        let parsedDetails = {};
        let orderType = "food";

        try {
          if (typeof order.order_details === "string") {
            parsedDetails = JSON.parse(order.order_details);
          } else {
            parsedDetails = order.order_details || {};
          }

          // Detect reservation-type order
          if (
            parsedDetails?.type === "reservation" ||
            parsedDetails?.date_time ||
            parsedDetails?.date ||
            parsedDetails?.party_size
          ) {
            orderType = "reservation";
          }

          // Detect FAQ requests (both 'faq' and 'faq_request')
          if (
            parsedDetails?.type === "faq" ||
            parsedDetails?.type === "faq_request"
          ) {
            orderType = "faq";
          }

          // Detect Callback requests (both 'callback' and 'callback_request')
          if (
            parsedDetails?.type === "callback" ||
            parsedDetails?.type === "callback_request"
          ) {
            orderType = "callback";
          }
        } catch (e) {
          console.error("Failed to parse order_details for:", order.id, e);
        }

        const normalizedOrder = {
          ...order,
          order_details: parsedDetails,
          order_type: orderType,
          relativeTime: getRelativeTime(order.timestamp.replace("Z", "")),
        };

        // Separate orders into categories
        switch (orderType) {
          case "reservation":
            let bookingDate = null;
            let startTime = null;

            // Handle new format with separate date and time fields
            if (parsedDetails.date && parsedDetails.time) {
              bookingDate = parsedDetails.date;
              startTime = parsedDetails.time;
            }
            // Handle old format with combined date_time field
            else if (parsedDetails.date_time) {
              const [datePart, timePart] = parsedDetails.date_time.split("T");
              const [year, month, day] = datePart.split("-");
              const fixedYear = parseInt(year) < 2025 ? "2025" : year;
              bookingDate = `${fixedYear}-${month}-${day}`;
              startTime = timePart || null;
            }

            reservationOrders.push({
              id: order.id,
              customer_name:
                parsedDetails.customer_name || order.customer_name || "Unknown",
              booking_date: bookingDate,
              start_time: startTime,
              end_time: parsedDetails.end_time || null,
              contact_info: order.phone_number,
              party_size: parsedDetails.party_size || null,
              timestamp: order.timestamp.replace("Z", ""),
            });
            break;

          case "faq":
            faqOrders.push({
              id: order.id,
              customer_name:
                parsedDetails.customer_name ||
                order.customer_name ||
                order.phone_number ||
                "Unknown",
              question: parsedDetails.question,
              answer: parsedDetails.answer,
              asked_at: parsedDetails.asked_at,
              customer_number:
                parsedDetails.customer_number || order.phone_number,
              timestamp: order.timestamp.replace("Z", ""),
            });
            break;

          case "callback":
            callbackOrders.push({
              id: order.id,
              customer_name:
                parsedDetails.customer_name || order.customer_name || "Unknown",
              callback_number:
                parsedDetails.callback_number || order.phone_number,
              requested_at: parsedDetails.requested_at,
              date: parsedDetails.date,
              time: parsedDetails.time,
              asap: parsedDetails.asap,
              timestamp: order.timestamp.replace("Z", ""),
            });
            break;

          default:
            foodOrders.push(normalizedOrder);
            break;
        }
      });

      const sortByTimestamp = (a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp);
      foodOrders.sort(sortByTimestamp);
      reservationOrders.sort(sortByTimestamp);
      faqOrders.sort(sortByTimestamp);
      callbackOrders.sort(sortByTimestamp);

      setOrderData({ ...orderResponse.data, data: foodOrders });
      setReservations(reservationOrders);
      setFaqOrders(faqOrders);
      setCallbackOrders(callbackOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      showError("Error fetching orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [restaurant]);





  // Filter data based on search query
  const filterBySearch = (items, searchFields) => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  };

  const filteredOrders = filterBySearch(orderData?.data || [], [
    "id",
    "phone_number",
    "customer_name",
    "order_number",
  ]);

  const filteredReservations = filterBySearch(reservations || [], [
    "id",
    "customer_name",
    "contact_info",
    "phone_number",
  ]);

  const filteredFaqOrders = filterBySearch(faqOrders || [], [
    "id",
    "customer_name",
    "customer_number",
    "question",
  ]);

  const filteredCallbackOrders = filterBySearch(callbackOrders || [], [
    "id",
    "customer_name",
    "callback_number",
  ]);

  // Handle item click to open sidebar
  const handleItemClick = (phoneNumber) => {
    setSelectedPhoneNumber(phoneNumber);
    setSidebarOpen(true);
  };

  // Filter data for sidebar by selected phone number
  const getSidebarData = () => {
    if (!selectedPhoneNumber)
      return { orders: [], reservations: [], faqs: [], callbacks: [] };

    return {
      orders: (orderData?.data || []).filter(
        (order) => order.phone_number === selectedPhoneNumber
      ),
      reservations: (reservations || []).filter(
        (res) =>
          res.contact_info === selectedPhoneNumber ||
          res.phone_number === selectedPhoneNumber
      ),
      faqs: (faqOrders || []).filter(
        (faq) =>
          faq.customer_number === selectedPhoneNumber ||
          faq.phone_number === selectedPhoneNumber
      ),
      callbacks: (callbackOrders || []).filter(
        (cb) =>
          cb.callback_number === selectedPhoneNumber ||
          cb.phone_number === selectedPhoneNumber
      ),
    };
  };

  return (
    <div className="dashboard-container">
      {/* Search Field */}

      {/* Dashboard Cards Grid */}
      <div className="dashboard-grid" style={{ position: "relative" }}>
        {/* Loading Overlay - Only covers the cards */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        )}
        <div className="dashboard-card-wrapper">
          <RecentOrdersCard
            onOpen={() => setActiveModal("orders")}
            orders={filteredOrders}
            onItemClick={handleItemClick}
            onStatusUpdate={fetchOrders}
          />
        </div>

        <div className="dashboard-card-wrapper">
          <ReservationsCard
            onOpen={() => setActiveModal("reservations")}
            reservations={filteredReservations}
            onItemClick={handleItemClick}
            onStatusUpdate={fetchOrders}
          />
        </div>

        <div className="dashboard-card-wrapper">
          <CallbackCard
            onOpen={() => setActiveModal("callbacks")}
            orders={filteredCallbackOrders}
            onItemClick={handleItemClick}
            onStatusUpdate={fetchOrders}
          />
        </div>

        <div className="dashboard-card-wrapper">
          <FAQsCard
            onOpen={() => setActiveModal("faqs")}
            orders={filteredFaqOrders}
            onItemClick={handleItemClick}
            onStatusUpdate={fetchOrders}
          />
        </div>
      </div>

      {/* Modals */}
      {/* Modals */}
      {activeModal === "orders" && (
        <RecentOrdersModal
          onClose={() => setActiveModal(null)}
          orders={filteredOrders}
          onStatusUpdate={fetchOrders}
        />
      )}
      {activeModal === "reservations" && (
        <ReservationsModal
          onClose={() => setActiveModal(null)}
          reservations={reservations}
          onStatusUpdate={fetchOrders}
        />
      )}
      {activeModal === "callbacks" && (
        <CallbackModal
          onClose={() => setActiveModal(null)}
          orders={callbackOrders}
          onStatusUpdate={fetchOrders}
        />
      )}
      {activeModal === "faqs" && (
        <FAQsModal
          onClose={() => setActiveModal(null)}
          orders={filteredFaqOrders}
          onStatusUpdate={fetchOrders}
        />
      )}

      {/* Customer Details Sidebar */}
      <CustomerDetailsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        phoneNumber={selectedPhoneNumber}
        {...getSidebarData()}
        onStatusUpdate={fetchOrders}
      />
    </div>
  );
};

export default RestaurantDashboard;
