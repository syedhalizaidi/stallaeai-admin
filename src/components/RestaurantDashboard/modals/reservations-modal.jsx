"use client";

import { useState, useMemo } from "react";
import "./reservations-modal.css";
import StatusDropdown from "../common/StatusDropdown.jsx";

export default function ReservationsModal({
  onClose,
  reservations = [],
  onStatusUpdate,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Convert reservations array into a map keyed by day of month for quick lookup
  const reservationsMap = useMemo(() => {
    const map = {};
    reservations.forEach((res) => {
      const day = new Date(res.booking_date).getDate();
      if (!map[day]) map[day] = [];
      map[day].push(res);
    });
    return map;
  }, [reservations]);

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getDayName = (date) =>
    date.toLocaleString("default", { weekday: "short" });

  const getDisplayReservations = () => {
    if (selectedDate !== null) {
      return reservationsMap[selectedDate] || [];
    }
    // All reservations in the current week
    const weekDates = getWeekDates();
    const weekReservations = [];
    weekDates.forEach((date) => {
      const day = date.getDate();
      if (reservationsMap[day]) {
        weekReservations.push(...reservationsMap[day]);
      }
    });
    return weekReservations;
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, () => null);
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );

  const weekDates = getWeekDates();
  const displayReservations = getDisplayReservations();

  const getDisplayTitle = () => {
    if (selectedDate !== null) {
      const dayName = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        selectedDate
      ).toLocaleString("default", { weekday: "long" });
      return `Reservations for ${dayName} ${selectedDate} ${
        monthName.split(" ")[0]
      }`;
    }
    return "Reservations for This Week";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Reservations</h2>
            <p className="modal-subtitle">View and manage all reservations</p>
          </div>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="reservations-space">
            {/* Week View Cards */}
            <div>
              <div className="week-header">
                <h3 className="week-title">Week Overview</h3>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="calendar-button"
                >
                  📅 Select Date
                </button>
              </div>

              <div className="week-grid">
                {weekDates.map((date, idx) => {
                  const dayNum = date.getDate();
                  const hasReservations = reservationsMap[dayNum]?.length > 0;
                  const isSelected = selectedDate === dayNum;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(dayNum)}
                      className={`week-day-card ${
                        isSelected ? "selected" : ""
                      } ${hasReservations ? "has-reservations" : ""}`}
                    >
                      <div className="day-name">{getDayName(date)}</div>
                      <div className="day-number">{dayNum}</div>
                      {hasReservations && (
                        <div
                          className={`booking-count ${
                            isSelected ? "selected-text" : ""
                          }`}
                        >
                          {reservationsMap[dayNum].length} booking
                          {reservationsMap[dayNum].length > 1 ? "s" : ""}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar View */}
            {showCalendar && (
              <div className="calendar-container">
                <div className="calendar-header">
                  <h3 className="calendar-title">{monthName}</h3>
                  <div className="calendar-nav">
                    <button onClick={prevMonth} className="nav-button">
                      ◀
                    </button>
                    <button onClick={nextMonth} className="nav-button">
                      ▶
                    </button>
                  </div>
                </div>

                <div className="weekdays-grid">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    (day) => (
                      <div key={day} className="weekday-name">
                        {day}
                      </div>
                    )
                  )}
                </div>

                <div className="calendar-days">
                  {emptyDays.map((_, idx) => (
                    <div key={`empty-${idx}`} className="empty-day"></div>
                  ))}
                  {days.map((day) => {
                    const hasReservations = reservationsMap[day]?.length > 0;
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          setSelectedDate(day);
                          setShowCalendar(false);
                        }}
                        className={`calendar-day ${
                          selectedDate === day ? "selected" : ""
                        } ${hasReservations ? "has-reservations" : ""}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reservations List */}
            <div>
              <h3 className="reservations-title">{getDisplayTitle()}</h3>
              <div className="reservations-list">
                {displayReservations.length > 0 ? (
                  displayReservations.map((res) => (
                    <div key={res.id} className="reservation-card">
                      <div className="res-header">
                        <div>
                          <h4 className="res-customer">{res.customer_name}</h4>
                          <p className="res-party">Party of {res.party_size}</p>
                        </div>
                        <span className="res-time">{res.start_time}</span>
                      </div>
                      <div className="res-footer">
                        <div className="res-contact">
                          <span>📞</span>
                          <span className="res-contact-text">
                            {res.contact_info}
                          </span>
                        </div>
                        <StatusDropdown
                          currentStatus={res.order_status}
                          orderId={res.id}
                          onUpdate={onStatusUpdate}
                          allowedStatuses={[
                            "pending",
                            "completed",
                            "cancelled",
                          ]}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>No reservations for this date</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
