import { useState } from "react";
import "./faqs-modal.css";
import Pagination from "../common/Pagination";
import { formatRelativeTime } from "../../../utils/orderUtils";

const ITEMS_PER_PAGE = 5;

export default function FAQsModal({ onClose, orders = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const pagedOrders = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedIndex(null); // Collapse when page changes
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Frequently Asked Questions</h2>
            <p className="modal-subtitle">Find answers to customer FAQs</p>
          </div>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="faqs-container">
            {pagedOrders.length === 0 && <p className="no-results" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No FAQs available</p>}

            {pagedOrders.map((faq, idx) => (
              <div key={faq.id} className="faq-item">
                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === idx ? null : idx)
                  }
                  className="faq-question"
                >
                  <h3>{faq.question}</h3>
                  <span
                    className={`chevron ${
                      expandedIndex === idx ? "rotated" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {expandedIndex === idx && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                    <p className="faq-meta">
                      Asked by: {faq.customer_name} | Number:{" "}
                      {faq.customer_number} |{" "}
                      {faq.timestamp ? formatRelativeTime(faq.timestamp) : "No date"}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={orders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
