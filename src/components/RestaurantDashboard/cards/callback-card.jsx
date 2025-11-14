"use client"

import Notes from "../Notes/Notes.jsx" 
import "./callback-card.css"

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
}) {
  const topOrders = orders.slice(0, 3)

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
            {topOrders.map((order) => (
              <div key={order.id} className="order-item">
                <p className="order-customer">{order.customer_name}</p>
                <p className="order-details">{order.callback_number}</p>
                <p className="order-time">{new Date(order.timestamp).toLocaleString()}</p>
              </div>
            ))}
            {topOrders.length === 0 && <p className="no-orders">No pending requests</p>}
          </div>

          <button className="card-button" onClick={onOpen}>
            View Requests
          </button>
        </div>
      </div>
    </div>
  )
}
