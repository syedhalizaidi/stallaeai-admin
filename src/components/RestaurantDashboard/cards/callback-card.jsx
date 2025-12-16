"use client";

import Notes from "../Notes/Notes.jsx" 
import "./callback-card.css"
import StatusDropdown from "../common/StatusDropdown.jsx";

export default function CallbackCard({
  onOpen,
  orders = [],
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
    orders.reduce((acc, item) => {
      // Use customer_name if available, otherwise fallback to callback_number or phone_number
      const identifier = `${item.customer_name} - ${item.callback_number || item.phone_number}` || "Unknown";
      if (!acc[identifier]) acc[identifier] = [];
      acc[identifier].push(item);
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
              <span>☎️</span>
            </div>
            <h3 className="card-title">Request a Call Back</h3>
          </div>

          <div className="orders-list">
            {topGroups.map(([identifier, items]) => (
              <div 
                key={identifier} 
                className="order-item clickable-item"
                onClick={() => onItemClick && onItemClick(items[0].callback_number)}
                style={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >
                <p className="order-customer">{identifier}</p>

                <div className="callback-scroll-container">
                  {items.map((item) => (
                    <div key={item.id} className="callback-block">
                      <p className="order-details">{item.callback_number}</p>
                      <p className="order-time">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
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
