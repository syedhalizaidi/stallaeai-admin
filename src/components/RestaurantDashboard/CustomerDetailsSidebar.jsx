"use client";

import { useEffect, useState } from "react";
import "./CustomerDetailsSidebar.css";
import StatusDropdown from "./common/StatusDropdown.jsx";
import { getOrderTotal, getOrderBreakdown, formatRelativeTime } from "../../utils/orderUtils";
import { updateCustomerName } from "../../services/restaurantDashboardService";
import { useToast } from "../../contexts/ToastContext";
import { Edit } from "lucide-react";

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

  const { showSuccess, showError } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  const firstOrder = orders[0] || reservations[0] || faqs[0] || callbacks[0];
  const initialName = firstOrder?.customer_name || "Unknown";

  useEffect(() => {
    setEditedName(initialName);
  }, [initialName, isOpen]);

  const handleUpdateName = async () => {
    if (!editedName.trim()) return;
    const res = await updateCustomerName(phoneNumber, editedName, orders[0].restaurant_number);
    if (res.success) {
      showSuccess("Name updated successfully");
      setIsEditingName(false);
    } else {
      showError(res.message);
    }
  };

  if (!isOpen) return null;


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
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-white text-black border border-gray-300 rounded px-2 py-1 text-lg font-bold w-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                />
                <button onClick={handleUpdateName} className="text-green-600 hover:text-green-700">✓</button>
                <button onClick={() => setIsEditingName(false)} className="text-red-600 hover:text-red-700">✕</button>
              </div>
            ) : (
              <h2 className="sidebar-title flex items-center gap-2">
                {editedName}
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="text-md text-black hover:text-gray-700 font-normal"
                >
                  <Edit size={16} />
                </button>
              </h2>
            )}
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
                            formatRelativeTime(order.timestamp)}
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
                            {(() => {
                              const breakdown = getOrderBreakdown(order);
                              return (
                                <>
                                  {breakdown.subtotal !== null && (
                                    <p
                                      className="item-price"
                                      style={{
                                        marginTop: "8px",
                                        fontSize: "0.9em",
                                        color: "#666",
                                      }}
                                    >
                                      Subtotal: ${breakdown.subtotal.toFixed(2)}
                                    </p>
                                  )}
                                  {breakdown.tax !== null && (
                                    <p
                                      className="item-price"
                                      style={{
                                        fontSize: "0.9em",
                                        color: "#666",
                                      }}
                                    >
                                      Tax: ${breakdown.tax.toFixed(2)}
                                    </p>
                                  )}
                                  <p
                                    className="item-price"
                                    style={{
                                      marginTop: "4px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Total: ${breakdown.total.toFixed(2)}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <>
                            <p className="item-info">
                              {itemsDetails.count} item
                              {itemsDetails.count !== 1 ? "s" : ""}
                            </p>
                            <p className="item-price">
                              ${getOrderTotal(order)}
                            </p>
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
                        {formatRelativeTime(reservation.timestamp)}
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
                        {formatRelativeTime(callback.timestamp)}
                      </span>
                    </div>
                    <div className="item-details">
                      <p className="item-info">📞 {callback.callback_number}</p>

                      {/* Detailed Callback Info */}
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="mb-1">
                          <span className="font-semibold">Callback: </span>
                          {callback.asap ? (
                            <span
                              style={{ color: "#ef4444", fontWeight: "bold" }}
                            >
                              ASAP
                            </span>
                          ) : callback.date && callback.time ? (
                            <span
                              style={{ color: "#2563eb", fontWeight: "500" }}
                            >
                              {new Date(
                                `${callback.date}T${callback.time}`
                              ).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">Rec'd: </span>
                          {callback.requested_at
                            ? new Date(callback.requested_at).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : new Date(callback.timestamp).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                        </div>
                      </div>
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
                        {formatRelativeTime(faq.timestamp)}
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
