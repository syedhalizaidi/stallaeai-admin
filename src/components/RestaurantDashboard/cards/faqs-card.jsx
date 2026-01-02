"use client"

import "./faqs-card.css"
import { formatRelativeTime } from "../../../utils/orderUtils.js";

export default function FAQsCard({
  onOpen,
  orders = [],
  onItemClick,
  onStatusUpdate,
  readOrders,
  onMarkAsRead,
  totalCount = 0,
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
            {sortedGroups.map(([identifier, faqs]) => {
              return (
              <div 
                key={identifier} 
                className="order-item clickable-item"
                onClick={() => {
                  if (onItemClick) onItemClick(faqs[0]);
                }}
                style={{ 
                  cursor: onItemClick ? 'pointer' : 'default'
                }}
              >
                <p className="order-customer">{identifier}</p>
                <div className="faq-scroll-container">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="faq-block">
                      <p className="order-details"><strong>Q:</strong> {faq.question}</p>
                      <p className="order-details"><strong>A:</strong> {faq.answer}</p>
                      <p className="order-time text-xs text-gray-400">
                        {faq.timestamp ? formatRelativeTime(faq.timestamp) : "No date"}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            )})}

            {sortedGroups.length === 0 && (
              <p className="text-center py-4 text-gray-400">No FAQs available</p>
            )}
          </div>

          <button className="card-button" onClick={onOpen}>
            View All ({totalCount})
          </button>
        </div>
      </div>
    </div>
  )
}
