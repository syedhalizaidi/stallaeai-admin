import { useEffect, useState } from "react";
import "react-calendar/dist/Calendar.css";
import {
    getOrders,
    getRestaurantById,
    getNote,
    createNote,
    deleteNote
} from "../services/restaurantDashboardService";
import ReservationsCard from "./RestaurantDashboard/cards/reservations-card.jsx";
import ReservationsModal from "./RestaurantDashboard/modals/reservations-modal.jsx";
import RecentOrdersCard from "./RestaurantDashboard/cards/recent-orders-card.jsx";
import RecentOrdersModal from "./RestaurantDashboard/modals/recent-orders-modal.jsx";
import FAQsCard from "./RestaurantDashboard/cards/faqs-card.jsx";
import FAQsModal from "./RestaurantDashboard/modals/faqs-modal.jsx";
import CallbackCard from "./RestaurantDashboard/cards/callback-card.jsx";
import CallbackModal from "./RestaurantDashboard/modals/callback-modal.jsx";
import "./dashboard.css"
import { useToast } from "../contexts/ToastContext.jsx";

const RestaurantDashboard = ({restaurant}) => {
    const {showSuccess, showError} = useToast();
    const [orderData, setOrderData] = useState([]);
    const [noteLoading, setNoteLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [uploadNote, setUploadNote] = useState("");
    const [reservationNote, setReservationNote] = useState("");
    const [callBackNote, setCallBackNote] = useState("");
    const [faqNote, setFaqNote] = useState("");
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [isNoteEnabled, setIsNoteEnabled] = useState(true);
    const [isReservationEnabled, setIsReservationEnabled] = useState(true);
    const [isCallBackEnabled, setIsCallBackEnabled] = useState(true);
    const [isFaqEnabled, setIsFaqEnabled] = useState(true);
    const [noteText, setNoteText] = useState(null);
    const [noteId, setNoteId] = useState(null);
    const userRole = localStorage.getItem("user_role");
    const [latestOrders, setLatestOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [activeModal, setActiveModal] = useState(false);


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
                    if (parsedDetails?.date_time || parsedDetails?.party_size) {
                        orderType = "reservation";
                    }
                } catch (e) {
                    console.error("Failed to parse order_details for:", order.id, e);
                }

                const normalizedOrder = {
                    ...order,
                    order_details: parsedDetails,
                    order_type: orderType,
                    relativeTime: getRelativeTime(order.timestamp),
                };

                if (orderType === "reservation") {
                    let bookingDate = null;
                    let startTime = null;

                    if (parsedDetails.date_time) {
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
                        timestamp: order.timestamp,
                    });

                } else {
                    foodOrders.push(normalizedOrder);
                }
            });

            // 🕒 Sort both types by timestamp (newest first)
            const sortByTimestamp = (a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp);

            foodOrders.sort(sortByTimestamp);
            reservationOrders.sort(sortByTimestamp);

            // 📦 Update states
            const latestThree = foodOrders.slice(0, 3);

            setLatestOrders(latestThree);
            setOrderData({
                ...orderResponse.data.data,
                data: foodOrders,
            });
            setReservations(reservationOrders);
            console.log("Reservationssss: ", reservations);
            console.log("Orderrrss: ", orderData);

        } catch (err) {
            console.error("Error fetching orders:", err);
            showError("Error fetching orders");
        }
    };


    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotes = async () => {
        const response = await getNote(restaurant.id);
        if (response.success) {
            setUploadNote(response.data?.message || "");
            setNoteId(response.data?.id || null);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleSubmitNote = async () => {
        setNoteLoading(true);
        try {
            const payload = {
                business_id: restaurant.id,
                message: uploadNote,
            };
            const response = await createNote(payload);
            if (response.success) {
                showSuccess("Note submitted successfully");
                fetchNotes();
                setIsEditingNote(false);
                setNoteText(uploadNote);
            } else {
                showError("Failed to submit note: " + response.message);
            }
        } catch (error) {
            showError("Failed to submit note: " + error);
        } finally {
            setNoteLoading(false);
        }
    };

    const handleReservationSubmitNote = async () => {
        setNoteLoading(true);
        try {
            const payload = {
                business_id: restaurant.id,
                message: reservationNote,
            };
            const response = await createReservationSubmitNote(payload);
            if (response.success) {
                showSuccess("Note submitted successfully");
                fetchNotes();
                setIsEditingNote(false);
                setNoteText(uploadNote);
            } else {
                showError("Failed to submit note: " + response.message);
            }
        } catch (error) {
            showError("Failed to submit note: " + error);
        } finally {
            setNoteLoading(false);
        }
    };

    const handleCallBackSubmitNote = async () => {
        setNoteLoading(true);
        try {
            const payload = {
                business_id: restaurant.id,
                message: callBackNote,
            };
            const response = await createCallBackSubmitNote(payload);
            if (response.success) {
                showSuccess("Note submitted successfully");
                fetchNotes();
                setIsEditingNote(false);
                setNoteText(uploadNote);
            } else {
                showError("Failed to submit note: " + response.message);
            }
        } catch (error) {
            showError("Failed to submit note: " + error);
        } finally {
            setNoteLoading(false);
        }
    };

    const handleFaqSubmitNote = async () => {
        setNoteLoading(true);
        try {
            const payload = {
                business_id: restaurant.id,
                message: faqNote,
            };
            const response = await createFaqSubmitNote(payload);
            if (response.success) {
                showSuccess("Note submitted successfully");
                fetchNotes();
                setIsEditingNote(false);
                setNoteText(uploadNote);
            } else {
                showError("Failed to submit note: " + response.message);
            }
        } catch (error) {
            showError("Failed to submit note: " + error);
        } finally {
            setNoteLoading(false);
        }
    };

    const handleDeleteNote = async () => {
        setDeleteLoading(true);
        try {
            const response = await deleteNote(restaurant.id);
            if (response.success) {
                showSuccess("Note deleted successfully");
                setUploadNote("");
                setNoteId(null);
            } else {
                showError("Failed to delete note: " + response.message);
            }
        } catch (error) {
            showError("Failed to delete note");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="dashboard-container">

            {/* Dashboard Cards Grid */}
            <div className="dashboard-grid">
                <div className="dashboard-card-wrapper">
                    <RecentOrdersCard
                        onOpen={() => setActiveModal("orders")}
                        orders={orderData?.data || []}
                        noteText={uploadNote}
                        setNoteText={setUploadNote}
                        handleSubmitNote={handleSubmitNote}
                        handleDeleteNote={handleDeleteNote}
                        noteLoading={noteLoading}
                        isNoteEnabled={isNoteEnabled}
                        setIsNoteEnabled={setIsNoteEnabled}
                    />
                </div>

                <div className="dashboard-card-wrapper">
                    <ReservationsCard
                        onOpen={() => setActiveModal("reservations")}
                        reservations={reservations || []}
                        noteText={reservationNote}
                        setNoteText={setReservationNote}
                        handleSubmitNote={handleReservationSubmitNote}
                        handleDeleteNote={handleDeleteNote}
                        noteLoading={noteLoading}
                        isNoteEnabled={isReservationEnabled}
                        setIsNoteEnabled={setIsReservationEnabled}
                    />
                </div>

                <div className="dashboard-card-wrapper">
                    <CallbackCard
                        onOpen={() => setActiveModal("callback")}
                        noteText={callBackNote}
                        setNoteText={setCallBackNote}
                        handleSubmitNote={handleCallBackSubmitNote}
                        handleDeleteNote={handleDeleteNote}
                        noteLoading={noteLoading}
                        isNoteEnabled={isCallBackEnabled}
                        setIsNoteEnabled={setIsCallBackEnabled}
                    />
                </div>

                <div className="dashboard-card-wrapper">
                    <FAQsCard
                        onOpen={() => setActiveModal("faqs")}
                        noteText={faqNote}
                        setNoteText={setFaqNote}
                        handleSubmitNote={handleFaqSubmitNote}
                        handleDeleteNote={handleDeleteNote}
                        noteLoading={noteLoading}
                        isNoteEnabled={isFaqEnabled}
                        setIsNoteEnabled={setIsFaqEnabled}
                    />
                </div>
            </div>



            {/* Modals */}
            {activeModal === "orders" && (
                <RecentOrdersModal
                    onClose={() => setActiveModal(null)}
                    orders={orderData?.data || []}
                />
            )}
            {activeModal === "reservations" && (
                <ReservationsModal
                    onClose={() => setActiveModal(null)}
                    reservations={reservations || []}
                />
            )}
            {activeModal === "callback" && <CallbackModal onClose={() => setActiveModal(null)} />}
            {activeModal === "faqs" && <FAQsModal onClose={() => setActiveModal(null)} />}
        </div>
    );
};

export default RestaurantDashboard;
