"use client"

import { useState } from "react"
import Notes from "../Notes/Notes.jsx"
import "./callback-card.css"

export default function CallbackCard({
  onOpen,
  callBackNote,
  setCallBackNote,
  handleCallBackSubmitNote,
  handleDeleteNote,
  noteLoading,
  isCallBackEnabled,
  setIsCallBackEnabled,
}) {
  return (
    <div className="card-container">
      <Notes
        noteText={callBackNote}
        setNoteText={setCallBackNote}
        handleSubmitNote={handleCallBackSubmitNote}
        handleDeleteNote={handleDeleteNote}
        noteLoading={noteLoading}
        isNoteEnabled={isCallBackEnabled}
        setIsNoteEnabled={setIsCallBackEnabled}
      />

      <div className="card">
        <div className="card-content">
          <div className="card-icon">
            <span>☎️</span>
          </div>
          <h3 className="card-title">Request a Call Back</h3>

          <div className="card-info">
            <p className="info-text">Manage customer call back requests</p>
            <p className="info-subtext">4 pending requests</p>
          </div>

          <button className="card-button" onClick={onOpen}>
            View Requests
          </button>
        </div>
      </div>
    </div>
  )
}
