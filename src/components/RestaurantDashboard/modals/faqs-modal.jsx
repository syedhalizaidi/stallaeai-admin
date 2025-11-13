"use client"

import { useState } from "react"
import "./faqs-modal.css"

export default function FAQsModal({ onClose }) {
  const [expandedIndex, setExpandedIndex] = useState(null)

  const faqs = [
    {
      question: "What are your operating hours?",
      answer:
        "We're open Monday to Sunday from 11:00 AM to 11:00 PM. For special events, please contact us in advance.",
    },
    {
      question: "Do you offer delivery services?",
      answer: "Yes, we offer delivery within a 5km radius. Orders must be placed at least 30 minutes in advance.",
    },
    {
      question: "Can I make group reservations?",
      answer: "Groups of 10 or more require advance notice. Please call us or use our reservation system.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, credit cards, debit cards, and mobile payment options like Apple Pay and Google Pay.",
    },
    {
      question: "Do you have vegetarian options?",
      answer: "Yes, we have a variety of vegetarian dishes available. Our staff can provide recommendations.",
    },
    {
      question: "How far in advance should I make a reservation?",
      answer:
        "For regular reservations, 24 hours is sufficient. For large groups, please provide at least one week notice.",
    },
    {
      question: "Can you accommodate dietary restrictions?",
      answer: "We can accommodate most dietary restrictions. Please inform us when making a reservation.",
    },
    {
      question: "What is your cancellation policy?",
      answer: "Cancellations made 24 hours before the reservation are free. Late cancellations may incur a fee.",
    },
  ]

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Frequently Asked Questions</h2>
            <p className="modal-subtitle">Find answers to common questions</p>
          </div>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="faqs-container">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <button onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)} className="faq-question">
                  <h3>{faq.question}</h3>
                  <span className={`chevron ${expandedIndex === idx ? "rotated" : ""}`}>▼</span>
                </button>

                {expandedIndex === idx && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
