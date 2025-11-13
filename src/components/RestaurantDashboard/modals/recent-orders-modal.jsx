"use client"

import { useState } from "react"
import "./recent-orders-modal.css"

export default function RecentOrdersModal({ onClose, orders = [] }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const mappedOrders = orders.map((order) => ({
    id: order.id,
    customer: order.customer_name || order.customer_info || "Unknown",
    items:
      order.order_type === "food"
        ? Object.keys(order.order_details || {})
        : ["Reservation"],
    price: order.total_amount || 0,
    status: order.order_status || "Pending",
  }))

  const filteredOrders = mappedOrders.filter((order) => {
    const matchesSearch = order.customer.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === "all" || order.status.toLowerCase() === filter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Recent Orders</h2>
            <p className="modal-subtitle">Manage and track all customer orders</p>
          </div>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="search-filter-container">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search by customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="customer-cell">
                      <span>{order.customer}</span>
                    </td>
                    <td className="id-cell">
                      <span>{order.id.substring(0, 12)}...</span>
                    </td>
                    <td className="items-cell">
                      <div className="items-container">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="item-badge">
                            {item}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="price-cell">
                      <span>${order.price.toFixed(2)}</span>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="no-results">
              <p>No orders found</p>
            </div>
          )}

          <div className="results-info">
            Showing {filteredOrders.length} of {mappedOrders.length} orders
          </div>
        </div>
      </div>
    </div>
  )
}
