"use client";

import Notes from "../Notes/Notes.jsx";
import "./reservations-card.css";
import StatusDropdown from "../common/StatusDropdown.jsx";

export default function ReservationsCard({
  onOpen,
  reservations = [],
  noteText,
  setNoteText,
  handleSubmitNote,
  handleDeleteNote,
  noteLoading,
  isNoteEnabled,
  setIsNoteEnabled,
  onItemClick,
  onStatusUpdate
}) {
  const grouped = Object.entries(
    reservations.reduce((acc, res) => {
      const phone = res.contact_info || "Unknown";
      if (!acc[phone]) acc[phone] = [];
      acc[phone].push(res);
      return acc;
    }, {})
  );

  grouped.forEach(([phone, items]) => {
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
      <Notes
        noteText={noteText}
        setNoteText={setNoteText}
        handleSubmitNote={handleSubmitNote}
        handleDeleteNote={handleDeleteNote}
        noteLoading={noteLoading}
        isNoteEnabled={isNoteEnabled}
        setIsNoteEnabled={setIsNoteEnabled}
      />

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
              topGroups.map(([phone, items]) => (
                <div 
                  key={phone} 
                  className="order-item clickable-item"
                  onClick={() => onItemClick && onItemClick(phone)}
                  style={{ cursor: onItemClick ? 'pointer' : 'default' }}
                >
                  <p className="order-customer">{phone}</p>
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
