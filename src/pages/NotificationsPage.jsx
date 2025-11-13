import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useToast } from "../contexts/ToastContext";

const NotificationPage = () => {
  const { showSuccess, showError } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState("");

  const handleAddNotification = () => {
    if (!newNotification.trim()) {
      showError("Please enter a notification message");
      return;
    }

    const newItem = {
      id: Date.now(),
      message: newNotification.trim(),
      timestamp: new Date().toLocaleString(),
    };

    setNotifications([newItem, ...notifications]);
    setNewNotification("");
    showSuccess("Notification added successfully!");
  };

  const handleClearAll = () => {
    if (notifications.length === 0) {
      showError("No notifications to clear");
      return;
    }
    setNotifications([]);
    showSuccess("All notifications cleared!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Notifications
          </h1>
          <p className="text-gray-600 mb-6">
            View and manage your app notifications.
          </p>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNotification}
                onChange={(e) => setNewNotification(e.target.value)}
                placeholder="Enter a notification message"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleAddNotification}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>

            {notifications.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-b-0"
                  >
                    <div>
                      <p className="text-gray-800 text-sm">{n.message}</p>
                      <span className="text-gray-400 text-xs">
                        {n.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleClearAll}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No notifications yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
