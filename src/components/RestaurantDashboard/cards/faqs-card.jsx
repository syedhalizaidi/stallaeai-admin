"use client"

import Notes from "../Notes/Notes.jsx" // adjust path if needed
import "./faqs-card.css"

export default function FAQsCard({
  onOpen,
  noteText,
  setNoteText,
  handleSubmitNote,
  handleDeleteNote,
  noteLoading,
  isNoteEnabled,
  setIsNoteEnabled,
}) {
  return (
    <div className="card-container">
      <Notes
        noteText={noteText}
        setNoteText={setNoteText}
        handleSubmitNote={handleSubmitNote}
        handleDeleteNote={handleDeleteNote}
        noteLoading={noteLoading}
        isNoteEnabled={isNoteEnabled}
        setIsNoteEnabled={setIsNoteEnabled}
      />

      <div className="card">
        <div className="card-content">
          <div className="card-icon">
            <span>❓</span>
          </div>
          <h3 className="card-title">FAQs</h3>

          <div className="card-info">
            <p className="info-text">Frequently Asked Questions</p>
            <p className="info-subtext">12 common questions</p>
          </div>

          <button className="card-button" onClick={onOpen}>
            View FAQs
          </button>
        </div>
      </div>
    </div>
  )
}
