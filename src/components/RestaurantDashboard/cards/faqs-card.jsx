"use client"

import Notes from "../Notes/Notes.jsx";
import "./faqs-card.css"

export default function FAQsCard({
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
              <span>❓</span>
            </div>
            <h3 className="card-title">FAQs</h3>
          </div>

          <div className="orders-list">
            {topOrders.map((faq) => (
              <div key={faq.id} className="order-item">
                <p className="order-customer">{faq.customer_name}</p>
                <p className="order-details"><strong>Q:</strong> {faq.question}</p>
                <p className="order-details"><strong>A:</strong> {faq.answer}</p>
                <p className="order-time">{new Date(faq.timestamp).toLocaleString()}</p>
              </div>
            ))}
            {topOrders.length === 0 && <p className="no-orders">No FAQs available</p>}
          </div>

          <button className="card-button" onClick={onOpen}>
            View FAQs
          </button>
        </div>
      </div>
    </div>
  )
}
