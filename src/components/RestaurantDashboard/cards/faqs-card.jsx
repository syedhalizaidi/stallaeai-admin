"use client"

import Notes from "../Notes/Notes.jsx";
import "./faqs-card.css"
import StatusDropdown from "../common/StatusDropdown.jsx";

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
  onItemClick,
  onStatusUpdate
}) {

  const groupedFAQs = Object.entries(
    orders.reduce((acc, item) => {
      const phone = item.customer_number || "Unknown"
      if (!acc[phone]) acc[phone] = []
      acc[phone].push(item)
      return acc
    }, {})
  )

  const sortedGroups = groupedFAQs.sort((a, b) => {
    const latestA = Math.max(...a[1].map(f => new Date(f.timestamp).getTime()))
    const latestB = Math.max(...b[1].map(f => new Date(f.timestamp).getTime()))
    return latestB - latestA
  })

  const topGroups = sortedGroups.slice(0, 3)

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
            {topGroups.map(([phoneNumber, faqs]) => (
              <div 
                key={phoneNumber} 
                className="order-item clickable-item"
                onClick={() => onItemClick && onItemClick(phoneNumber)}
                style={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >

                <p className="order-customer">{phoneNumber}</p>
                <div className="faq-scroll-container">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="faq-block">
                      <p className="order-details"><strong>Q:</strong> {faq.question}</p>
                      <p className="order-details"><strong>A:</strong> {faq.answer}</p>
                      <p className="order-time">
                        {new Date(faq.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            ))}

            {topGroups.length === 0 && (
              <p className="no-orders">No FAQs available</p>
            )}
          </div>

          <button className="card-button" onClick={onOpen}>
            View FAQs
          </button>
        </div>
      </div>
    </div>
  )
}
