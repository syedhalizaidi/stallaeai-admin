"use client";

import "./callback-card.css"
import { formatRelativeTime } from "../../../utils/orderUtils";

export default function CallbackCard({
  onOpen,
  orders = [],
  onItemClick,
  onStatusUpdate,
  readOrders,
  onMarkAsRead,
  totalCount = 0,
}) {
  const grouped = Object.entries(
    orders.reduce((acc, item) => {
      const phone =
        `${item.customer_name} - ${
          item.callback_number || item.phone_number
        }` || "Unknown";
      if (!acc[phone]) acc[phone] = [];
      acc[phone].push(item);
      return acc;
    }, {})
  );

  grouped.forEach(([phone, items]) => {
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
              <span>☎️</span>
            </div>
            <h3 className="card-title">Request a Call Back</h3>
          </div>

          <div className="orders-list">
            {grouped.map(([phone, items]) => {
              const isRead = items.every(i => i.is_read || readOrders?.has(i.id));
              
              return (
              <div
                key={phone}
                className={`order-item clickable-item ${!isRead ? 'unread-item' : ''}`}
                onClick={() => {
                  if (onMarkAsRead) {
                    const idsToMark = items.filter(i => !i.is_read && !readOrders?.has(i.id)).map(i => i.id);
                    if (idsToMark.length > 0) onMarkAsRead(idsToMark);
                  }
                  if (onItemClick) onItemClick(items[0]);
                }}
                style={{ 
                  cursor: onItemClick ? "pointer" : "default",
                  background: isRead ? 'linear-gradient(135deg, #dbe7fa 0%, #c6dbf8 100%)' : '#ffffff',
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
                <p className="order-customer" style={{ fontWeight: !isRead ? 'bold' : 'normal' }}>{items[0].customer_name} - {items[0].callback_number}</p>

                <div className="callback-scroll-container">
                  {items.map((item) => (
                    <div key={item.id} className="callback-block">
                      <p className="order-details" style={{ fontWeight: !isRead ? 'bold' : 'normal' }}>{item.callback_number}</p>
                      <div className="order-time flex flex-col text-xs text-gray-500">
                        {/* Callback Target Time */}
                        <div className="mb-0.5">
                          <span className="font-medium text-gray-600">
                            Callback:{" "}
                          </span>
                          {item.asap ? (
                            <span className="text-red-500 font-bold">ASAP</span>
                          ) : item.date && item.time ? (
                            <span className="text-blue-600 font-medium">
                              {new Date(`${item.date}T${item.time}Z`).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                timeZone: 'UTC'
                              })}
                            </span>
                          ) : item.requested_at ? (
                            <span className="text-blue-600 font-medium">
                              {new Date(item.requested_at.replace(' ', 'T') + (item.requested_at.includes('Z') ? '' : 'Z')).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                timeZone: 'UTC'
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </div>

                        {/* Request Originated At */}
                        {item.requested_at && (
                          <div className="mb-0.5">
                            <span className="font-medium text-gray-600">
                              Req'd At:{" "}
                            </span>
                            <span className="text-gray-500">
                              {new Date(item.requested_at.replace(' ', 'T') + (item.requested_at.includes('Z') ? '' : 'Z')).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                timeZone: 'UTC'
                              })}
                            </span>
                          </div>
                        )}

                        {/* Request Received Time */}
                        <div>
                          <span className="font-medium text-gray-600">
                            Rec'd:{" "}
                          </span>
                          {formatRelativeTime(item.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )})}

            {grouped.length === 0 && (
              <p className="text-center py-4 text-gray-400">No requests</p>
            )}
          </div>

          <button className="card-button" onClick={onOpen}>
            View All ({totalCount})
          </button>
        </div>
      </div>
    </div>
  );
}
