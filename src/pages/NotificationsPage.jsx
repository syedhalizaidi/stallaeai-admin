import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useToast } from "../contexts/ToastContext";
import { restaurantService } from "../services/restaurantService";

const NotificationPage = () => {
  const { showSuccess, showError, showInfo } = useToast();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "System initialized successfully.",
      timestamp: new Date().toLocaleString(),
      type: "info",
    },
    {
      id: 2,
      message: "Weekly analytics report available.",
      timestamp: new Date().toLocaleString(),
      type: "info",
    },
  ]);

  const LOCAL_KEY = "business_count";

  const addNotification = (message, type = "info") => {
    const item = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleString(),
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const checkBusinessUpdates = async () => {
    const result = await restaurantService.getRestaurants();

    if (!result.success) {
      showError("Failed to fetch restaurant list");
      return;
    }

    const list = result.data || [];
    const apiCount = list.length;
    const savedCount = Number(localStorage.getItem(LOCAL_KEY) || 0);

    if (savedCount === 0) {
      localStorage.setItem(LOCAL_KEY, apiCount);
    } else {
      if (apiCount > savedCount) {
        const diff = apiCount - savedCount;
        const msg =
          diff === 1
            ? "A new restaurant has been added."
            : `${diff} new restaurants have been added.`;

        showSuccess(msg);
        addNotification(msg, "success");
      } else if (apiCount < savedCount) {
        const diff = savedCount - apiCount;
        const msg =
          diff === 1
            ? "A restaurant has been removed."
            : `${diff} restaurants have been removed.`;

        showInfo(msg);
        addNotification(msg, "info");
      }
    }

    localStorage.setItem(LOCAL_KEY, apiCount);
  };

  useEffect(() => {
    checkBusinessUpdates();

    // Show a toast after 5 seconds
    const timer = setTimeout(() => {
      showInfo("You have 1 new notification");
      addNotification("1 new notification received automatically", "info");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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
            Your recent activity and system updates.
          </p>

          {notifications.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-b-0"
                >
                  <div>
                    <p className="text-gray-800 text-sm">{n.message}</p>
                    <span className="text-gray-400 text-xs">{n.timestamp}</span>
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
  );
};

export default NotificationPage;
