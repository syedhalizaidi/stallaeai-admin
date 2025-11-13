"use client"

import { useState } from "react"
import { Trash2, X } from "lucide-react"
import "./notes.scss"

export default function Notes({
  noteText,
  setNoteText,
  handleSubmitNote,
  handleDeleteNote,
  noteLoading,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isNoteEnabled, setIsNoteEnabled] = useState(true)

  if (!isNoteEnabled) {
    return (
      <div className="card-notes disabled-note">
        <p>Notes are currently disabled.</p>
        <button className="enable-button" onClick={() => setIsNoteEnabled(true)}>
          Enable Notes
        </button>
      </div>
    )
  }

  const hasNote = noteText && noteText.trim() !== ""

  return (
    <div className="card-notes">
      {isEditing ? (
        <>
          <textarea
            className="notes-input"
            placeholder="Add notes here..."
            value={noteText || ""}
            onChange={(e) => setNoteText(e.target.value)}
            rows={2}
          />
          <div className="notes-button-row">
            <button
              onClick={() => {
                handleSubmitNote()
                setIsEditing(false)
              }}
              disabled={noteLoading || !(noteText || "").trim()}
              className="submit-note-button"
            >
              {noteLoading ? "Saving..." : "Submit"}
            </button>
            <button onClick={() => setIsEditing(false)} className="cancel-note-button">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div
          className="notes-placeholder-container"
          onClick={() => !hasNote && setIsEditing(true)}
        >
          <div className="notes-placeholder-text">{hasNote ? noteText : "Click here to add Note"}</div>

          <div className="notes-action-buttons">
            {hasNote && (
              <button
                className="icon-button delete-note-button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteNote()
                  setNoteText("")
                  setIsEditing(false)
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              className="icon-button disable-note-button"
              onClick={(e) => {
                e.stopPropagation()
                setIsNoteEnabled(false)
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

      )}
    </div>
  )
}
