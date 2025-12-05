"use client";

import { useState } from "react";
import "./callback-modal.css";
import StatusDropdown from "../common/StatusDropdown.jsx";

export default function CallbackModal({ onClose, orders = [], onStatusUpdate }) {
  const [search, setSearch] = useState("");

  const filteredRequests = orders.filter((req) =>
    req.customer_name.toLowerCase().includes(search.toLowerCase())
  );

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
            {filteredRequests.length === 0 && (
              <p>No call back requests found</p>
            )}

            {filteredRequests.map((req) => (
              <div key={req.id} className="request-card">
                <div className="req-header">
                  <div className="req-avatar">
                    {req.customer_name.charAt(0)}
                  </div>
                  <div className="req-info">
                    <h4 className="req-customer">{req.customer_name}</h4>
                    <p className="req-phone">{req.callback_number}</p>
                  </div>
                  <StatusDropdown 
                    currentStatus={req.order_status} 
                    orderId={req.id} 
                    onUpdate={onStatusUpdate}
                    allowedStatuses={['pending', 'completed']}
                  />
                </div>

                <div className="req-details">
                  <div className="detail-item">
                    <p className="detail-label">Requested At</p>
                    <p className="detail-value">
                      {new Date(req.requested_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="req-actions">
                  <button className="action-button primary">Call Now</button>
                  <button className="action-button secondary">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
