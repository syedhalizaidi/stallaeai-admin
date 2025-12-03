"use client"
import Notes from "../Notes/Notes.jsx" 
import "./recent-orders-card.css"

export default function RecentOrdersCard({
  onOpen,
  orders = [],
  noteText,
  setNoteText,
  handleSubmitNote,
  handleDeleteNote,
  noteLoading
}) {
  const groupedOrders = orders.reduce((acc, item) => {
    const phone = item.phone_number || "Unknown";
    if (!acc[phone]) acc[phone] = [];
    acc[phone].push(item);
    return acc;
  }, {});

  const groupedArray = Object.entries(groupedOrders).map(([phone, list]) => {
    const sortedList = list.slice().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return [phone, sortedList];
  });

  groupedArray.sort((a, b) => {
    const latestA = new Date(a[1][0]?.timestamp).getTime() || 0;
    const latestB = new Date(b[1][0]?.timestamp).getTime() || 0;
    return latestB - latestA;
  });

  const topGroups = groupedArray.slice(0, 3);

  return (
    <div className="card-container">
      {/* Reusable Notes Component */}
      <Notes
        noteText={noteText}
        setNoteText={setNoteText}
        handleSubmitNote={handleSubmitNote}
        handleDeleteNote={handleDeleteNote}
        noteLoading={noteLoading}
      />

      <div className="card">
        <div className="card-content">
          <div className="card-header">
            <div className="card-icon">
              <span>📋</span>
            </div>
            <h3 className="card-title">Recent Orders</h3>
          </div>
          <div className="orders-list">
            {topGroups.map(([phone, list]) => (
              <div key={phone} className="order-item">
                <p className="order-customer">{phone}</p>

                <div className="order-scroll-container">
                  {list.map((order) => (
                    <div key={order.id} className="order-block">
                      <p className="order-details">
                        {Object.keys(order.order_details || {}).length} items · ${order.total_amount}
                      </p>
                      <p className="order-time">{order.relativeTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="card-button" onClick={onOpen}>
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
}
