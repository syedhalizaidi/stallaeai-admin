"use client"
import Notes from "../Notes/Notes.jsx" 
import "./recent-orders-card.css"
import StatusDropdown from "../common/StatusDropdown.jsx";

export default function RecentOrdersCard({
  onOpen,
  orders = [],
  noteText,
  setNoteText,
  handleSubmitNote,
  handleDeleteNote,
  noteLoading,
  onItemClick,
  onStatusUpdate
}) {
  // Helper function to get order items summary
  const getOrderItemsSummary = (orderDetails) => {
    if (!orderDetails || typeof orderDetails !== 'object') {
      return { count: 0, text: 'No items' };
    }

    // Check if it's a food order with items array
    if (orderDetails.items && Array.isArray(orderDetails.items)) {
      const totalItems = orderDetails.items.reduce((sum, item) => sum + (item.qty || 1), 0);
      const itemNames = orderDetails.items.map(item => 
        `${item.name}${item.qty > 1 ? ` (x${item.qty})` : ''}`
      ).join(', ');
      return { count: totalItems, text: itemNames };
    }

    // Fallback: count object keys (excluding metadata fields)
    const excludeKeys = ['type', 'subtotal', 'tax', 'total', 'special_instructions'];
    const itemKeys = Object.keys(orderDetails).filter(key => !excludeKeys.includes(key));
    return { count: itemKeys.length, text: `${itemKeys.length} items` };
  };

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
              <div 
                key={phone} 
                className="order-item clickable-item"
                onClick={() => onItemClick && onItemClick(phone)}
                style={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >
                <p className="order-customer">{phone}</p>

                <div className="order-scroll-container">
                  {list.map((order) => {
                    const itemsSummary = getOrderItemsSummary(order.order_details);
                    return (
                      <div key={order.id} className="order-block">
                        <div className="flex justify-between items-start mb-1">
                          <p className="order-details flex-1 mr-2" title={itemsSummary.text}>
                            {itemsSummary.count} item{itemsSummary.count !== 1 ? 's' : ''} · ${order.total_amount}
                          </p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                            order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            order.order_status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                            order.order_status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {order.order_status ? order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1) : 'Pending'}
                          </span>
                        </div>
                        <p className="order-time">{order.relativeTime}</p>
                      </div>
                    );
                  })}
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
