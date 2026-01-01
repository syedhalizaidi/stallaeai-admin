"use client";

import "./reservations-card.css";
import StatusDropdown from "../common/StatusDropdown.jsx";

export default function ReservationsCard({
  onOpen,
  reservations = [],
  onItemClick,
  onStatusUpdate
}) {
  const grouped = Object.entries(
    reservations.reduce((acc, res) => {
      // Use customer_name if available, otherwise fallback to contact_info
      const identifier = `${res.customer_name} - ${res.contact_info || res.phone_number}` || "Unknown";
      if (!acc[identifier]) acc[identifier] = [];
      acc[identifier].push(res);
      return acc;
    }, {})
  );

  grouped.forEach(([identifier, items]) => {
    items.sort(
      (a, b) =>
        new Date(`${b.booking_date}T${b.start_time || "00:00"}`).getTime() -
        new Date(`${a.booking_date}T${a.start_time || "00:00"}`).getTime()
    );
  });
  grouped.sort((a, b) => {
    const latestA = new Date(
      `${a[1][0].booking_date}T${a[1][0].start_time || "00:00"}`
    ).getTime();
    const latestB = new Date(
      `${b[1][0].booking_date}T${b[1][0].start_time || "00:00"}`
    ).getTime();
    return latestB - latestA;
  });
  const topGroups = grouped.slice(0, 3);

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
            {topGroups.length > 0 ? (
              topGroups.map(([identifier, items]) => (
                <div 
                  key={identifier} 
                  className="order-item clickable-item"
                  onClick={() => onItemClick && onItemClick(items[0]?.contact_info)}
                  style={{ cursor: onItemClick ? 'pointer' : 'default' }}
                >
                  <p className="order-customer">{identifier}</p>
                  <div className="reservation-scroll-container">
                    {items.map((res) => (
                      <div key={res.id} className="reservation-block">
                        <p className="info-customer">{res.customer_name}</p>
                        <p className="info-details">
                          📍 {res.booking_date} at {res.start_time || "-"}
                        </p>
                        <p className="info-details">
                          📞 {res.contact_info || "-"}
                        </p>
                        <hr />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p>No upcoming reservations</p>
            )}
          </div>

          <button className="card-button" onClick={onOpen}>
            Manage Reservations
          </button>
        </div>
      </div>
    </div>
  );
}
