import { useEffect, useState, useRef } from "react";
import "react-calendar/dist/Calendar.css";
import {
  getOrders,
  markOrderAsRead as markAsReadService,
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
import { formatRelativeTime, normalizeTimestamp } from "../utils/orderUtils";
import { useToast } from "../contexts/ToastContext";

const ITEMS_PER_PAGE = 3;

const RestaurantDashboard = ({ restaurant, searchQuery }) => {
  const { showInfo } = useToast();
  const [orderData, setOrderData] = useState({ data: [] });

  const [reservations, setReservations] = useState([]);
  const [activeModal, setActiveModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [readOrders, setReadOrders] = useState(new Set());
  const [shownAsapNotifications, setShownAsapNotifications] = useState(() => {
    const stored = sessionStorage.getItem('asap_callback_notifications_shown');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const [pages, setPages] = useState({
    food: 1,
    reservation: 1,
    callback: 1,
    faq: 1,
  });

  const handleMarkAsRead = async (orderIds) => {
    const ids = Array.isArray(orderIds) ? orderIds : [orderIds];
    const unreadIds = ids.filter((id) => id && !readOrders.has(id));

    if (unreadIds.length === 0) return;

    setReadOrders((prev) => {
      const newSet = new Set(prev);
      unreadIds.forEach((id) => newSet.add(id));
      return newSet;
    });

    try {
      await Promise.all(unreadIds.map((id) => markAsReadService(id)));
    } catch (err) {
      console.error("Failed to mark orders as read:", err);
    }
  };

  const [faqOrders, setFaqOrders] = useState([]);
  const [callbackOrders, setCallbackOrders] = useState([]);
  const prevRestaurantId = useRef(null);

  useEffect(() => {
    if (restaurant?.id && restaurant.id !== prevRestaurantId.current) {
      setIsLoading(true);
      prevRestaurantId.current = restaurant.id;
      setPages({ food: 1, reservation: 1, callback: 1, faq: 1 });
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

      const orderResponse = await getOrders({
        twilio_phone_number: phone,
        page_size: 200,
      });
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

          if (parsedDetails?.type === "callback" || parsedDetails?.type === "callback_request") {
            orderType = "callback";
          } else if (parsedDetails?.type === "faq" || parsedDetails?.type === "faq_request") {
            orderType = "faq";
          } else if (
            parsedDetails?.type === "reservation" ||
            parsedDetails?.party_size ||
            (parsedDetails?.date && !parsedDetails?.type) // Only fallback to date if no type is present
          ) {
            orderType = "reservation";
          }
        } catch (e) {
          console.error("Failed to parse order_details for:", order.id, e);
        }

        const normalizedOrder = {
          ...order,
          order_details: parsedDetails,
          order_type: orderType,
          relativeTime: formatRelativeTime(order.timestamp),
          is_read: order.is_read,
        };

        switch (orderType) {
          case "reservation":
            // Only show pending reservations in cards
            if (order.order_status === "pending") {
              let bookingDate = parsedDetails.date || null;
              let startTime = parsedDetails.time || null;
              if (!bookingDate && parsedDetails.date_time) {
                [bookingDate, startTime] = parsedDetails.date_time.split("T");
              }
              reservationOrders.push({
                ...normalizedOrder,
                customer_name:
                  parsedDetails.customer_name ||
                  order.customer_name ||
                  "Unknown",
                booking_date: bookingDate,
                start_time: startTime,
                contact_info: order.phone_number,
                party_size: parsedDetails.party_size || null,
              });
            }
            break;
          case "faq":
            // Only show pending FAQs in cards
            if (order.order_status === "pending") {
              faqOrders.push({
                ...normalizedOrder,
                customer_name:
                  parsedDetails.customer_name ||
                  order.customer_name ||
                  order.phone_number ||
                  "Unknown",
                customer_number:
                  parsedDetails.customer_number || order.phone_number,
                question:
                  parsedDetails.question ||
                  parsedDetails.query ||
                  parsedDetails.user_query ||
                  "",
                answer:
                  parsedDetails.answer ||
                  parsedDetails.response ||
                  parsedDetails.answer_text ||
                  "",
              });
            }
            break;
          case "callback":
            // Only show pending callbacks in cards
            if (order.order_status === "pending") {
              callbackOrders.push({
                ...normalizedOrder,
                customer_name:
                  parsedDetails.customer_name ||
                  order.customer_name ||
                  "Unknown",
                callback_number:
                  parsedDetails.number ||
                  parsedDetails.callback_number ||
                  order.phone_number,
                requested_at: parsedDetails.requested_at || null,
                asap: parsedDetails.asap || false,
                date: parsedDetails.date || null,
                time: parsedDetails.time || null,
              });
            }
            break;
          default:
            // Only show pending food orders in cards (exclude completed and cancelled)
            if (order.order_status === "pending") {
              foodOrders.push(normalizedOrder);
            }
            break;
        }
      });

      const sortByTimestamp = (a, b) => {
        const timeA = normalizeTimestamp(a.timestamp);
        const timeB = normalizeTimestamp(b.timestamp);
        if (!timeA && !timeB) return 0;
        if (!timeA) return 1;
        if (!timeB) return -1;
        return timeB.getTime() - timeA.getTime();
      };
      
      foodOrders.sort(sortByTimestamp);
      reservationOrders.sort(sortByTimestamp);
      faqOrders.sort(sortByTimestamp);

      // Deduplicate callbackOrders before sorting final list
      const deduplicatedCallbacks = [];
      const seenCallbacks = new Map();
      
      // Sort newest first
      callbackOrders.sort(sortByTimestamp);

      callbackOrders.forEach(item => {
        const normalizedNum = (item.callback_number || "").toString().replace(/\D/g, "");
        const key = normalizedNum || item.callback_number || "Unknown";
        
        const existing = seenCallbacks.get(key);
        
        if (existing) {
          const itemTime = normalizeTimestamp(item.timestamp);
          const existingTime = normalizeTimestamp(existing.timestamp);
          
          if (itemTime && existingTime) {
            const timeDiff = Math.abs(itemTime.getTime() - existingTime.getTime());
            const thirtyMinutes = 30 * 60 * 1000;
            
            // If timestamps are close, also check requested_at if available
            if (timeDiff < thirtyMinutes) {
              const itemReqAt = item.requested_at;
              const existingReqAt = existing.requested_at;
              
              // If requested_at is specified for both, check if they are same/close
              if (itemReqAt && existingReqAt && itemReqAt === existingReqAt) {
                return; // Skip identical requested_at within 30 mins
              }
              
              // If one doesn't have requested_at and they are very close in timestamp, still likely a duplicate
              return; // Skip duplicate based on timestamp alone
            }
          } else {
            // Fallback: If normalized timestamps failed but they arrived exactly at same time (string comparison)
            if (item.timestamp === existing.timestamp) {
              return;
            }
          }
        }
        seenCallbacks.set(key, item);
        deduplicatedCallbacks.push(item);
      });

      // Use the deduplicated list
      const finalCallbackOrders = deduplicatedCallbacks;
      finalCallbackOrders.sort(sortByTimestamp);

      setOrderData({ ...orderResponse.data, data: foodOrders });
      setReservations(reservationOrders);
      setFaqOrders(faqOrders);
      setCallbackOrders(finalCallbackOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s is sufficient given manual refresh or status updates
    return () => clearInterval(interval);
  }, [restaurant]);

  // Filter data based on search query
  const filterBySearch = (items, searchFields) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter((item) =>
      searchFields.some((field) =>
        String(item[field] || "")
          .toLowerCase()
          .includes(query)
      )
    );
  };

  const filteredOrders = filterBySearch(orderData.data, [
    "id",
    "phone_number",
    "customer_name",
  ]);
  const filteredReservations = filterBySearch(reservations, [
    "id",
    "customer_name",
    "phone_number",
  ]);
  const filteredFaqOrders = filterBySearch(faqOrders, [
    "id",
    "customer_name",
    "customer_number",
  ]);
  const filteredCallbackOrders = filterBySearch(callbackOrders, [
    "id",
    "customer_name",
    "callback_number",
  ]);

  const getPagedData = (data, type) => {
    const page = pages[type];
    const start = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  // Detect and notify about new ASAP callbacks (only for visible cards)
  useEffect(() => {
    if (isLoading || callbackOrders.length === 0) return;

    // Get only the callbacks visible in the current page
    const visibleCallbacks = getPagedData(filteredCallbackOrders, "callback");

    const unreadAsapCallbacks = visibleCallbacks.filter(
      (callback) => callback.asap && !callback.is_read && !readOrders.has(callback.id)
    );

    if (unreadAsapCallbacks.length === 0) return;

    // Check for new ASAP callbacks that haven't been notified yet
    const newAsapCallbacks = unreadAsapCallbacks.filter(
      (callback) => !shownAsapNotifications.has(callback.id)
    );

    if (newAsapCallbacks.length > 0) {
      // Show toast notification
      const count = newAsapCallbacks.length;
      showInfo(
        `${count} new ASAP callback request${count > 1 ? 's' : ''} received!`,
        { duration: 5000 }
      );

      // Mark these callbacks as notified
      const updatedNotifications = new Set(shownAsapNotifications);
      newAsapCallbacks.forEach((callback) => updatedNotifications.add(callback.id));
      setShownAsapNotifications(updatedNotifications);
      sessionStorage.setItem(
        'asap_callback_notifications_shown',
        JSON.stringify([...updatedNotifications])
      );
    }
  }, [callbackOrders, isLoading, readOrders, shownAsapNotifications, showInfo, filteredCallbackOrders, pages]);

  const handlePageChange = (type, direction) => {
    setPages((prev) => ({
      ...prev,
      [type]: Math.max(1, prev[type] + direction),
    }));
  };

  const handleItemClick = (order) => {
    setSelectedPhoneNumber(
      order.phone_number || order.callback_number || order.customer_number
    );
    setSidebarOpen(true);
  };

  const getSidebarData = () => {
    if (!selectedPhoneNumber)
      return { orders: [], reservations: [], faqs: [], callbacks: [] };
    const filterByNum = (arr) =>
      arr.filter(
        (i) =>
          i.phone_number === selectedPhoneNumber ||
          i.customer_number === selectedPhoneNumber ||
          i.callback_number === selectedPhoneNumber ||
          i.contact_info === selectedPhoneNumber
      );
    return {
      orders: filterByNum(orderData.data),
      reservations: filterByNum(reservations),
      faqs: filterByNum(faqOrders),
      callbacks: filterByNum(callbackOrders),
    };
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid" style={{ position: "relative" }}>
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        )}

        <div className="dashboard-card-wrapper">
          <RecentOrdersCard
            onOpen={() => setActiveModal("orders")}
            orders={getPagedData(filteredOrders, "food")}
            totalCount={filteredOrders.length}
            currentPage={pages.food}
            onPageChange={(dir) => handlePageChange("food", dir)}
            onItemClick={handleItemClick}
            onStatusUpdate={fetchOrders}
            readOrders={readOrders}
            onMarkAsRead={(ids) => handleMarkAsRead(ids)}
          />
        </div>

        <div className="dashboard-card-wrapper">
          <ReservationsCard
            onOpen={() => setActiveModal("reservations")}
            reservations={getPagedData(filteredReservations, "reservation")}
            totalCount={filteredReservations.length}
            currentPage={pages.reservation}
            onPageChange={(dir) => handlePageChange("reservation", dir)}
            onItemClick={handleItemClick}
            onStatusUpdate={fetchOrders}
            readOrders={readOrders}
            onMarkAsRead={(ids) => handleMarkAsRead(ids)}
          />
        </div>

        <div className="dashboard-card-wrapper">
          <CallbackCard
            onOpen={() => setActiveModal("callbacks")}
            orders={getPagedData(filteredCallbackOrders, "callback")}
            totalCount={filteredCallbackOrders.length}
            currentPage={pages.callback}
            onPageChange={(dir) => handlePageChange("callback", dir)}
            onItemClick={handleItemClick}
            onStatusUpdate={fetchOrders}
            readOrders={readOrders}
            onMarkAsRead={(ids) => handleMarkAsRead(ids)}
          />
        </div>

        <div className="dashboard-card-wrapper">
          <FAQsCard
            onOpen={() => setActiveModal("faqs")}
            orders={getPagedData(filteredFaqOrders, "faq")}
            totalCount={filteredFaqOrders.length}
            currentPage={pages.faq}
            onPageChange={(dir) => handlePageChange("faq", dir)}
            onItemClick={handleItemClick}
            onStatusUpdate={fetchOrders}
            readOrders={readOrders}
            onMarkAsRead={(ids) => handleMarkAsRead(ids)}
          />
        </div>
      </div>

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
          reservations={filteredReservations}
          onStatusUpdate={fetchOrders}
        />
      )}
      {activeModal === "callbacks" && (
        <CallbackModal
          onClose={() => setActiveModal(null)}
          orders={filteredCallbackOrders}
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
