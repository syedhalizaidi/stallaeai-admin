import { useState, useMemo } from "react";
import "./reservations-modal.css";
import StatusDropdown from "../common/StatusDropdown.jsx";
import Pagination from "../common/Pagination";

const ITEMS_PER_PAGE = 5;

export default function ReservationsModal({
  onClose,
  reservations = [],
  onStatusUpdate,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const reservationsMap = useMemo(() => {
    const map = {};
    reservations.forEach((res) => {
      // Ensure we get YYYY-MM-DD part
      let dateKey = res.booking_date; 
      if (dateKey && dateKey.includes("T")) {
        dateKey = dateKey.split("T")[0];
      }
      
      if (dateKey) {
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(res);
      }
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

  const getISODateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fullDisplayReservations = useMemo(() => {
    if (selectedDate !== null) {
      return reservationsMap[selectedDate] || [];
    }
    // All reservations in the current week
    const weekDates = getWeekDates();
    const weekReservations = [];
    weekDates.forEach((date) => {
      const dateKey = getISODateString(date);
      if (reservationsMap[dateKey]) {
        weekReservations.push(...reservationsMap[dateKey]);
      }
    });
    return weekReservations;
  }, [selectedDate, currentDate, reservationsMap]);

  // Reset page when selection changes
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedDate, currentDate]);

  const pagedReservations = fullDisplayReservations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const getDisplayTitle = () => {
    if (selectedDate !== null) {
      // selectedDate is "YYYY-MM-DD"
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      
      const dayName = dateObj.toLocaleString("default", { weekday: "long" });
      const monthStr = dateObj.toLocaleString("default", { month: "long" });
      
      return `Reservations for ${dayName} ${d} ${monthStr}`;
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
                  const dateKey = getISODateString(date);
                  const hasReservations = reservationsMap[dateKey]?.length > 0;
                  const isSelected = selectedDate === dateKey;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(dateKey)}
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
                          {reservationsMap[dateKey].length} booking
                          {reservationsMap[dateKey].length > 1 ? "s" : ""}
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
                    const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dateKey = getISODateString(currentMonthDate);
                    
                    const hasReservations = reservationsMap[dateKey]?.length > 0;
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          setSelectedDate(dateKey);
                          setShowCalendar(false);
                        }}
                        className={`calendar-day ${
                          selectedDate === dateKey ? "selected" : ""
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <h3 className="reservations-title">{getDisplayTitle()}</h3>
              <div className="reservations-list" style={{ flex: 1, overflowY: 'auto' }}>
                {pagedReservations.length > 0 ? (
                  pagedReservations.map((res) => (
                    <div key={res.id} className="reservation-card">
                      <div className="res-header">
                        <div>
                          <h4 className="res-customer">{`${res.customer_name} - ${res.phone_number || res.contact_info}` || "Unknown"}</h4>
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
                  <div className="no-results" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    <p>No reservations found</p>
                  </div>
                )}
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={fullDisplayReservations.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
