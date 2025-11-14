"use client"

import { useState } from "react"
import Notes from "../Notes/Notes.jsx" 
import "./reservations-card.css"

export default function ReservationsCard({
  onOpen,
  reservations = [],
  noteText,
  setNoteText,
  handleSubmitNote,
  handleDeleteNote,
  noteLoading,
  isNoteEnabled,
  setIsNoteEnabled,
}) {
  const sortedReservations = reservations
    .slice()
    .sort(
      (a, b) =>
        new Date(`${a.booking_date}T${a.start_time}`) -
        new Date(`${b.booking_date}T${b.start_time}`)
    )

  const nextReservations = sortedReservations.slice(0, 1)

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
          <div className="card-header">
            <div className="card-icon">
              <span>📅</span>
            </div>
            <h3 className="card-title">Reservations</h3>
          </div>
          {nextReservations.length > 0 ? (
            nextReservations.map((res) => (
              <div key={res.id} className="reservation-info">
                <p className="info-label">Next Reservation</p>
                <p className="info-customer">{res.customer_name}</p>
                <p className="info-details">
                  📍 {res.booking_date} at {res.start_time || "-"}
                </p>
                <p className="info-details">📞 {res.contact_info || "-"}</p>
              </div>
            ))
          ) : (
            <p>No upcoming reservations</p>
          )}

          <button className="card-button" onClick={onOpen}>
            Manage Reservations
          </button>
        </div>
      </div>
    </div>
  )
}
