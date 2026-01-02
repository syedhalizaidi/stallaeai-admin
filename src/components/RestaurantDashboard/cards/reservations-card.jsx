"use client";

import "./reservations-card.css";
import { formatRelativeTime } from "../../../utils/orderUtils";

export default function ReservationsCard({
  onOpen,
  reservations = [],
  onItemClick,
  onStatusUpdate,
  readOrders,
  onMarkAsRead,
  totalCount = 0,
}) {
  const grouped = Object.entries(
    reservations.reduce((acc, res) => {
      const identifier =
        `${res.customer_name} - ${res.contact_info || res.phone_number}` ||
        "Unknown";
      if (!acc[identifier]) acc[identifier] = [];
      acc[identifier].push(res);
      return acc;
    }, {})
  );

  grouped.forEach(([identifier, items]) => {
    items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });
  grouped.sort((a, b) => {
    const latestA = new Date(a[1][0].timestamp).getTime();
    const latestB = new Date(b[1][0].timestamp).getTime();
    return latestB - latestA;
  });

  return (
    <div className="card-container">
      <div className="card">
        <div className="card-content">
          <div className="card-header">
            <div className="card-icon">
              <span>📅</span>
            </div>
            <h3 className="card-title">Reservations</h3>
          </div>

          <div className="orders-list">
            {grouped.length > 0 ? (
              grouped.map(([identifier, items]) => {
                const isRead = items.every(
                  (i) => i.is_read || readOrders?.has(i.id)
                );

                return (
                  <div
                    key={identifier}
                    className={`order-item clickable-item ${
                      !isRead ? "unread-item" : ""
                    }`}
                    onClick={() => {
                      if (onMarkAsRead) {
                        const unreadIds = items.filter(i => !i.is_read && !readOrders?.has(i.id)).map(i => i.id);
                        if (unreadIds.length > 0) onMarkAsRead(unreadIds);
                      }
                      if (onItemClick) onItemClick(items[0]);
                    }}
                    style={{
                      cursor: onItemClick ? "pointer" : "default",
                      background: isRead
                        ? "linear-gradient(135deg, #dbe7fa 0%, #c6dbf8 100%)"
                        : "#ffffff",
                      position: 'relative'
                    }}
                  >
                    {!isRead && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6'
                      }} />
                    )}
                    <p
                      className="order-customer"
                      style={{ fontWeight: !isRead ? "bold" : "normal" }}
                    >
                      {identifier}
                    </p>
                    <div className="reservation-scroll-container">
                      {items.map((res) => (
                        <div key={res.id} className="reservation-block">
                          <p
                            className="info-customer"
                            style={{ fontWeight: !isRead ? "bold" : "normal" }}
                          >
                            {res.customer_name}
                          </p>
                          <p className="info-details">
                            📍 {res.booking_date} at {res.start_time || "-"}
                          </p>
                          <p className="info-details">
                            📞 {res.contact_info || res.phone_number || "-"}
                          </p>
                          <p className="info-details text-xs text-gray-400">
                            Rec'd: {formatRelativeTime(res.timestamp)}
                          </p>
                          <hr />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-4 text-gray-400">No reservations</p>
            )}
          </div>

          <button className="card-button" onClick={onOpen}>
            Manage All ({totalCount})
          </button>
        </div>
      </div>
    </div>
  );
}
