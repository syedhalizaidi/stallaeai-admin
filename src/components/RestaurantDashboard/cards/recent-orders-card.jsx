"use client"
import Notes from "../Notes/Notes.jsx" 
import "./recent-orders-card.css"

export default function RecentOrdersCard({ onOpen, orders = [], noteText, setNoteText, handleSubmitNote, handleDeleteNote, noteLoading }) {
  const topOrders = orders.slice(0, 3)

  return (
    <div className="card-container">
      {/* Reusable Notes Component */}
      <Notes
        noteText={noteText}
        setNoteText={setNoteText}
        handleSubmitNote={handleSubmitNote}
        handleDeleteNote={handleDeleteNote}
        noteLoading={noteLoading}
      />

      <div className="card">
        <div className="card-content">
          <div className="card-header">
            <div className="card-icon">
              <span>📋</span>
            </div>
            <h3 className="card-title">Recent Orders</h3>
          </div>
          <div className="orders-list">
            {topOrders.map((order) => (
              <div key={order.id} className="order-item">
                <p className="order-customer">{order.customer_name}</p>
                <p className="order-details">
                  {Object.keys(order.order_details || {}).length} items · ${order.total_amount}
                </p>
                <p className="order-time">{order.relativeTime}</p>
              </div>
            ))}
          </div>

          <button className="card-button" onClick={onOpen}>
            View All Orders
          </button>
        </div>
      </div>
    </div >
  )
}
