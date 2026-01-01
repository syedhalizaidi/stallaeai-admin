"use client"

import "./faqs-card.css"
import StatusDropdown from "../common/StatusDropdown.jsx";

export default function FAQsCard({
  onOpen,
  orders = [],
  onItemClick,
  onStatusUpdate
}) {

  const groupedFAQs = Object.entries(
    orders.reduce((acc, item) => {
      // Use customer_name if available, otherwise fallback to customer_number or phone_number
      const identifier = `${item.customer_name} - ${item.customer_number || item.phone_number}` || "Unknown";
      if (!acc[identifier]) acc[identifier] = []
      acc[identifier].push(item)
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
      <div className="card">
        <div className="card-content">
          <div className="card-header">
            <div className="card-icon">
              <span>❓</span>
            </div>
            <h3 className="card-title">FAQs</h3>
          </div>

          <div className="orders-list">
            {topGroups.map(([identifier, faqs]) => (
              <div 
                key={identifier} 
                className="order-item clickable-item"
                onClick={() => onItemClick && onItemClick(faqs[0]?.customer_number || faqs[0]?.phone_number)}
                style={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >

                <p className="order-customer">{identifier}</p>
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
