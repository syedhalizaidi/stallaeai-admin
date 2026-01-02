import { useState, useMemo } from "react";
import "./recent-orders-modal.css";
import StatusDropdown from "../common/StatusDropdown";
import Pagination from "../common/Pagination";
import { getOrderTotal, getOrderBreakdown } from "../../../utils/orderUtils";

const ITEMS_PER_PAGE = 5;

export default function RecentOrdersModal({
  onClose,
  orders = [],
  onStatusUpdate,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const getOrderItems = (orderDetails) => {
    if (!orderDetails || typeof orderDetails !== "object") {
      return [];
    }

    if (orderDetails.items && Array.isArray(orderDetails.items)) {
      return orderDetails.items.map(
        (item) => `${item.name}${item.qty > 1 ? ` (x${item.qty})` : ""}`
      );
    }

    const excludeKeys = [
      "type",
      "subtotal",
      "tax",
      "total",
      "special_instructions",
    ];
    return Object.keys(orderDetails).filter(
      (key) => !excludeKeys.includes(key)
    );
  };

  const filteredOrders = useMemo(() => {
    const mapped = orders.map((order) => ({
      id: order.id,
      customer: `${order.customer_name} - ${order.phone_number || order.customer_info}` || "Unknown",
      items: getOrderItems(order.order_details),
      price: getOrderTotal(order),
      status: order.order_status === 'pending' ? 'In Progress' :
             order.order_status === 'cancelled' ? 'Declined' :
             order.order_status === 'completed' ? 'Completed' : 
             (order.order_status || "Pending"),
    }));

    const filtered = mapped.filter((order) => {
      const matchesSearch = order.customer
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" || order.status.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });

    return filtered;
  }, [orders, search, filter]);

  // Reset page when search/filter changes
  useMemo(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const pagedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Recent Orders</h2>
            <p className="modal-subtitle">
              Manage and track all customer orders
            </p>
          </div>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="search-filter-container">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search by customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="customer-cell">
                      <span>{order.customer}</span>
                    </td>
                    <td className="id-cell">
                      <span>{order.id.substring(0, 12)}...</span>
                    </td>
                    <td className="items-cell">
                      <div className="items-container">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="item-badge">
                            {item}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="price-cell">
                      <span>${order.price.toFixed(2)}</span>
                    </td>
                    <td className="status-cell">
                      <StatusDropdown
                        currentStatus={order.status}
                        orderId={order.id}
                        onUpdate={onStatusUpdate}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagedOrders.length === 0 && (
              <div className="no-results">
                <p>No orders found</p>
              </div>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
