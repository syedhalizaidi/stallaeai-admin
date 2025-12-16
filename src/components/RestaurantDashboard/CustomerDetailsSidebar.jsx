"use client";

import { useEffect } from "react";
import "./CustomerDetailsSidebar.css";
import StatusDropdown from "./common/StatusDropdown.jsx";

export default function CustomerDetailsSidebar({
  isOpen,
  onClose,
  phoneNumber,
  orders = [],
  reservations = [],
  faqs = [],
  callbacks = [],
  onStatusUpdate,
}) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const cleanTimestamp = timestamp.replace("+00:00Z", "Z");
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

  // Helper function to get order items details
  const getOrderItemsDetails = (orderDetails) => {
    if (!orderDetails || typeof orderDetails !== "object") {
      return { count: 0, items: [] };
    }

    // Check if it's a food order with items array
    if (orderDetails.items && Array.isArray(orderDetails.items)) {
      const totalItems = orderDetails.items.reduce(
        (sum, item) => sum + (item.qty || 1),
        0
      );
      return {
        count: totalItems,
        items: orderDetails.items.map((item) => ({
          name: item.name,
          qty: item.qty || 1,
          price: item.price || 0,
        })),
      };
    }

    // Fallback: count object keys (excluding metadata fields)
    const excludeKeys = [
      "type",
      "subtotal",
      "tax",
      "total",
      "special_instructions",
    ];
    const itemKeys = Object.keys(orderDetails).filter(
      (key) => !excludeKeys.includes(key)
    );
    return { count: itemKeys.length, items: [] };
  };

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <div className="customer-sidebar">
        <div className="sidebar-header">
          <div>
            <h2 className="sidebar-title">Customer Details</h2>
            <p className="sidebar-phone">Phone Number: {phoneNumber}</p>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sidebar-content">
          {/* Recent Orders Section */}
          <div className="sidebar-section">
            <h3 className="section-title">
              📋 Recent Orders
              <span className="section-count">{orders.length}</span>
            </h3>
            {orders.length > 0 ? (
              <div className="section-items">
                {orders.map((order) => {
                  const itemsDetails = getOrderItemsDetails(
                    order.order_details
                  );
                  return (
                    <div key={order.id} className="sidebar-item">
                      <div className="item-header">
                        <span className="item-id">{order.customer_name}</span>
                        <span className="item-time">
                          {order.relativeTime ||
                            getRelativeTime(order.timestamp)}
                        </span>
                      </div>
                      <div className="item-details">
                        {itemsDetails.items.length > 0 ? (
                          <div className="order-items-list">
                            {itemsDetails.items.map((item, idx) => (
                              <p key={idx} className="item-info">
                                • {item.name}{" "}
                                {item.qty > 1 ? `(x${item.qty})` : ""} - $
                                {(item.price * item.qty).toFixed(2)}
                              </p>
                            ))}
                            <p
                              className="item-price"
                              style={{ marginTop: "8px", fontWeight: "bold" }}
                            >
                              Total: ${order.total_amount}
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="item-info">
                              {itemsDetails.count} item
                              {itemsDetails.count !== 1 ? "s" : ""}
                            </p>
                            <p className="item-price">${order.total_amount}</p>
                          </>
                        )}
                      </div>
                      <div className="mt-2 flex justify-end">
                        <StatusDropdown
                          currentStatus={order.order_status}
                          orderId={order.id}
                          onUpdate={onStatusUpdate}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="section-empty">No orders found</p>
            )}
          </div>

          {/* Reservations Section */}
          <div className="sidebar-section">
            <h3 className="section-title">
              📅 Reservations
              <span className="section-count">{reservations.length}</span>
            </h3>
            {reservations.length > 0 ? (
              <div className="section-items">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="sidebar-item">
                    <div className="item-header">
                      <span className="item-name">
                        {reservation.customer_name?.charAt(0).toUpperCase() +
                          reservation.customer_name?.slice(1)}
                      </span>
                      <span className="item-time">
                        {getRelativeTime(reservation.timestamp)}
                      </span>
                    </div>
                    <div className="item-details">
                      <p className="item-info">
                        📍 {reservation.booking_date} at{" "}
                        {reservation.start_time || "-"}
                      </p>
                      <p className="item-info">
                        👥 Party of {reservation.party_size || "N/A"}
                      </p>
                      <div className="mt-2 flex justify-end">
                        <StatusDropdown
                          currentStatus={reservation.order_status}
                          orderId={reservation.id}
                          onUpdate={onStatusUpdate}
                          allowedStatuses={[
                            "pending",
                            "completed",
                            "cancelled",
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="section-empty">No reservations found</p>
            )}
          </div>

          {/* Callbacks Section */}
          <div className="sidebar-section">
            <h3 className="section-title">
              ☎️ Callback Requests
              <span className="section-count">{callbacks.length}</span>
            </h3>
            {callbacks.length > 0 ? (
              <div className="section-items">
                {callbacks.map((callback) => (
                  <div key={callback.id} className="sidebar-item">
                    <div className="item-header">
                      <span className="item-name">
                        {callback.customer_name}
                      </span>
                      <span className="item-time">
                        {getRelativeTime(callback.timestamp)}
                      </span>
                    </div>
                    <div className="item-details">
                      <p className="item-info">📞 {callback.callback_number}</p>
                      {callback.requested_at && (
                        <p className="item-info">
                          Requested:{" "}
                          {new Date(callback.requested_at).toLocaleString()}
                        </p>
                      )}
                      <div className="mt-2 flex justify-end">
                        <StatusDropdown
                          currentStatus={callback.order_status}
                          orderId={callback.id}
                          onUpdate={onStatusUpdate}
                          allowedStatuses={["pending", "completed"]}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="section-empty">No callback requests found</p>
            )}
          </div>

          {/* FAQs Section */}
          <div className="sidebar-section">
            <h3 className="section-title">
              ❓ FAQs
              <span className="section-count">{faqs.length}</span>
            </h3>
            {faqs.length > 0 ? (
              <div className="section-items">
                {faqs.map((faq) => (
                  <div key={faq.id} className="sidebar-item">
                    <div className="item-header">
                      <span className="item-time">
                        {getRelativeTime(faq.timestamp)}
                      </span>
                    </div>
                    <div className="item-details">
                      <p className="item-question">
                        <strong>{faq.customer_name}</strong>
                      </p>
                    </div>
                    <div className="item-details">
                      <p className="item-question">
                        <strong>Q:</strong> {faq.question}
                      </p>
                      {faq.answer && (
                        <p className="item-answer">
                          <strong>A:</strong> {faq.answer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="section-empty">No FAQs found</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
