"use client";

import "./recent-orders-card.css"
import { getOrderTotal, formatRelativeTime } from "../../../utils/orderUtils";

export default function RecentOrdersCard({
  onOpen,
  orders = [],
  onItemClick,
  onStatusUpdate,
  readOrders,
  onMarkAsRead,
  totalCount = 0,
}) {
  // ... (getOrderItemsSummary remains the same)
  const getOrderItemsSummary = (orderDetails) => {
    if (!orderDetails || typeof orderDetails !== "object") {
      return { count: 0, text: "No items" };
    }

    if (orderDetails.items && Array.isArray(orderDetails.items)) {
      const totalItems = orderDetails.items.reduce(
        (sum, item) => sum + (item.qty || 1),
        0
      );
      const itemNames = orderDetails.items
        .map((item) => `${item.name}${item.qty > 1 ? ` (x${item.qty})` : ""}`)
        .join(", ");
      return { count: totalItems, text: itemNames };
    }

    const excludeKeys = [
      "type",
      "subtotal",
      "tax",
      "total",
      "special_instructions",
    ];
    const itemKeys = Object.keys(orderDetails).filter(
      (key) => !excludeKeys.includes(key)
    );
    return { count: itemKeys.length, text: `${itemKeys.length} items` };
  };

  const activeOrders = orders.filter(order => 
    order.order_status !== 'completed' && order.order_status !== 'cancelled'
  );

  const groupedOrders = orders.reduce((acc, item) => {
    const phone = `${item.customer_name} - ${item.customer_number || item.phone_number}` || "Unknown";
    if (!acc[phone]) acc[phone] = [];
    acc[phone].push(item);
    return acc;
  }, {});

  const groupedArray = Object.entries(groupedOrders).map(([phone, list]) => {
    const sortedList = list
      .slice()
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    return [phone, sortedList];
  });

  groupedArray.sort((a, b) => {
    const latestA = new Date(a[1][0]?.timestamp).getTime() || 0;
    const latestB = new Date(b[1][0]?.timestamp).getTime() || 0;
    return latestB - latestA;
  });

  return (
    <div className="card-container">
      <div className="card">
        <div className="card-content">
          <div className="card-header">
            <div className="card-icon">
              <span>📋</span>
            </div>
            <h3 className="card-title">Recent Orders</h3>
          </div>
          <div className="orders-list">
            {groupedArray.map(([phone, list]) => {
              const isRead = list.every(o => o.is_read || readOrders?.has(o.id));
              
              return (
              <div
                key={phone}
                className={`order-item clickable-item ${!isRead ? 'unread-item' : ''}`}
                onClick={() => {
                  if (onMarkAsRead) {
                    const idsToMark = list.filter(o => !o.is_read && !readOrders?.has(o.id)).map(o => o.id);
                    if (idsToMark.length > 0) onMarkAsRead(idsToMark);
                  }
                  if (onItemClick) onItemClick(list[0]);
                }}
                style={{ 
                  cursor: onItemClick ? "pointer" : "default",
                  background: isRead ? 'linear-gradient(135deg, #dbe7fa 0%, #c6dbf8 100%)' : '#ffffff',
                  position: 'relative'
                }}
              >
                {!isRead && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6'
                  }} />
                )}
                <p className="order-customer" style={{ fontWeight: !isRead ? 'bold' : 'normal' }}>{phone}</p>

                <div className="order-scroll-container">
                  {list.map((order) => {
                    const itemsSummary = getOrderItemsSummary(
                      order.order_details
                    );
                    return (
                      <div key={order.id} className="order-block">
                        <div className="flex justify-between items-start mb-1">
                          <p
                            className="order-details flex-1 mr-2"
                            title={itemsSummary.text}
                            style={{ fontWeight: !isRead ? 'bold' : 'normal' }}
                          >
                            {itemsSummary.count} item
                            {itemsSummary.count !== 1 ? "s" : ""} · $
                            {getOrderTotal(order)}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                              order.order_status === "pending"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {order.order_status === "pending" ? "In Progress" : 
                             (order.order_status
                              ? order.order_status.charAt(0).toUpperCase() +
                                order.order_status.slice(1)
                              : "Pending")}
                          </span>
                        </div>
                        <p className="order-time">{formatRelativeTime(order.timestamp)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )})}

            {groupedArray.length === 0 && (
              <div className="text-center py-4 text-gray-400">No active orders</div>
            )}
          </div>

          <button className="card-button" onClick={onOpen}>
            View All ({totalCount})
          </button>
        </div>
      </div>
    </div>
  );
}
