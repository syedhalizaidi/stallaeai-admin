"use client"

import { useState } from "react"
import "./recent-orders-modal.css"
import StatusDropdown from "../common/StatusDropdown.jsx";

export default function RecentOrdersModal({ onClose, orders = [], onStatusUpdate }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  // Helper function to get order items
  const getOrderItems = (orderDetails) => {
    if (!orderDetails || typeof orderDetails !== 'object') {
      return [];
    }

    // Check if it's a food order with items array
    if (orderDetails.items && Array.isArray(orderDetails.items)) {
      return orderDetails.items.map(item => 
        `${item.name}${item.qty > 1 ? ` (x${item.qty})` : ''}`
      );
    }

    // Fallback: return object keys (excluding metadata fields)
    const excludeKeys = ['type', 'subtotal', 'tax', 'total', 'special_instructions'];
    return Object.keys(orderDetails).filter(key => !excludeKeys.includes(key));
  };

  const mappedOrders = orders.map((order) => ({
    id: order.id,
    customer: order.customer_name || order.customer_info || "Unknown",
    items: getOrderItems(order.order_details),
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
                      <StatusDropdown 
                        currentStatus={order.status} 
                        orderId={order.id} 
                        onUpdate={onStatusUpdate}
                      />
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
