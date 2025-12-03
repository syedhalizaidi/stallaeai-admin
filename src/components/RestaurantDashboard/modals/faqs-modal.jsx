"use client";

import { useState } from "react";
import "./faqs-modal.css";

export default function FAQsModal({ onClose, orders = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

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
            {orders.length === 0 && <p>No FAQs available</p>}

            {orders.map((faq, idx) => (
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
                      {new Date(faq.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
