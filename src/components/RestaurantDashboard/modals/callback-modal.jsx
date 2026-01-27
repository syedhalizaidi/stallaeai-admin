import { useState, useMemo } from "react";
import "./callback-modal.css";
import StatusDropdown from "../common/StatusDropdown";
import Pagination from "../common/Pagination";

const ITEMS_PER_PAGE = 5;

export default function CallbackModal({
  onClose,
  orders = [],
  onStatusUpdate,
}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRequests = useMemo(() => {
    return orders.filter((req) =>
      req.customer_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);

  // Reset page when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [search]);

  const pagedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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
            {pagedRequests.length === 0 && (
              <p className="no-results" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No call back requests found</p>
            )}

            {pagedRequests.map((req) => (
              <div key={req.id} className="request-card">
                <div className="req-header">
                  <div className="req-avatar">
                    {req.customer_name.charAt(0)}
                  </div>
                  <div className="req-info">
                    <h4 className="req-customer">{`${req.customer_name} - ${req.phone_number}` || req.phone_number || "Unknown"}</h4>
                  </div>
                  <StatusDropdown
                    currentStatus={req.order_status}
                    orderId={req.id}
                    onUpdate={onStatusUpdate}
                    allowedStatuses={["pending", "completed"]}
                  />
                </div>

                <div className="req-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="detail-item">
                    <p className="detail-label">Callback Target</p>
                    <p className="detail-value">
                      {req.asap ? (
                        <span style={{ color: "#ef4444", fontWeight: "bold" }}>ASAP</span>
                      ) : req.date && req.time ? (
                        <span style={{ color: "#2563eb", fontWeight: "500" }}>
                           {new Date(`${req.date}T${req.time}`).toLocaleString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                           })}
                        </span>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>Not specified</span>
                      )}
                    </p>
                  </div>
                  <div className="detail-item">
                    <p className="detail-label">Received At</p>
                    <p className="detail-value">
                      {req.requested_at 
                        ? new Date(req.requested_at).toLocaleString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })
                        : new Date(req.timestamp).toLocaleString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })
                      }
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

          <Pagination
            currentPage={currentPage}
            totalItems={filteredRequests.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
