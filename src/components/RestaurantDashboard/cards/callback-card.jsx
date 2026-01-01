"use client";

import "./callback-card.css"

export default function CallbackCard({
  onOpen,
  orders = [],
  onItemClick,
  onStatusUpdate,
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

  const topGroups = grouped.slice(0, 3);

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
            {topGroups.map(([phone, items]) => (
              <div
                key={phone}
                className="order-item clickable-item"
                onClick={() =>
                  onItemClick && onItemClick(items[0].callback_number)
                }
                style={{ cursor: onItemClick ? "pointer" : "default" }}
              >
                <p className="order-customer">{items[0].customer_name} - {items[0].callback_number}</p>

                <div className="callback-scroll-container">
                  {items.map((item) => (
                    <div key={item.id} className="callback-block">
                      <p className="order-details">{item.callback_number}</p>
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
                              {new Date(
                                `${item.date}T${item.time}`
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

                        {/* Request Received Time */}
                        <div>
                          <span className="font-medium text-gray-600">
                            Rec'd:{" "}
                          </span>
                          {item.requested_at
                            ? new Date(item.requested_at).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : new Date(item.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {topGroups.length === 0 && (
              <p className="no-orders">No pending requests</p>
            )}
          </div>

          <button className="card-button" onClick={onOpen}>
            View Requests
          </button>
        </div>
      </div>
    </div>
  );
}
