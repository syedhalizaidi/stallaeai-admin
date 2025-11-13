"use client"

import { useState } from "react"
import "./callback-modal.css"

export default function CallbackModal({ onClose }) {
  const [search, setSearch] = useState("")

  const callRequests = [
    {
      id: 1,
      customer: "Ahmed",
      phone: "+923001234567",
      requestedTime: "19:00",
      status: "pending",
      requestDate: "2025-11-10",
    },
    {
      id: 2,
      customer: "Layla",
      phone: "+923009876543",
      requestedTime: "18:30",
      status: "pending",
      requestDate: "2025-11-10",
    },
    {
      id: 3,
      customer: "Omar",
      phone: "+923005555555",
      requestedTime: "20:00",
      status: "completed",
      requestDate: "2025-11-09",
    },
    {
      id: 4,
      customer: "Zainab",
      phone: "+923003333333",
      requestedTime: "17:30",
      status: "pending",
      requestDate: "2025-11-10",
    },
  ]

  const filteredRequests = callRequests.filter((req) => req.customer.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Call Back Requests</h2>
            <p className="modal-subtitle">Manage customer call back requests</p>
          </div>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="requests-list">
            {filteredRequests.map((req) => (
              <div key={req.id} className="request-card">
                <div className="req-header">
                  <div className="req-avatar">{req.customer.charAt(0)}</div>
                  <div className="req-info">
                    <h4 className="req-customer">{req.customer}</h4>
                    <p className="req-phone">{req.phone}</p>
                  </div>
                  <span className={`req-status ${req.status}`}>
                    {req.status === "pending" ? "⏳ Pending" : "✓ Completed"}
                  </span>
                </div>

                <div className="req-details">
                  <div className="detail-item">
                    <p className="detail-label">Requested Time</p>
                    <p className="detail-value">{req.requestedTime}</p>
                  </div>
                  <div className="detail-item">
                    <p className="detail-label">Request Date</p>
                    <p className="detail-value">{req.requestDate}</p>
                  </div>
                </div>

                <div className="req-actions">
                  {req.status === "pending" && (
                    <>
                      <button className="action-button primary">Call Now</button>
                      <button className="action-button secondary">Reschedule</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="no-results">
              <p>No call back requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
