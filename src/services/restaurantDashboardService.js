import { apiClient, apiClient2 } from "./config";

export const registerRestaurant = async (restaurantData) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.post(
      "/restaurant/register-restaurant",
      restaurantData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      restaurantId: response.data?.id || response.data?.data?.id,
      message: "Restaurant registered successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Restaurant registration failed",
    };
  }
};

export const getRestaurants = async () => {
  try {

    const token = localStorage.getItem("access_token");

    const response = await apiClient.get("/business/my",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return {
      success: true,
      data: response.data,
    };
  }
  catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to retrieve Restaurants",
    };
  }
}


export const getAllRestaurants = async () => {
  try {
    const response = await apiClient.get("/business/");
    console.log("All Restaurant:",response);
    
    
    return {
      success: true,
      data: response.data,
    };
  }
  catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to retrieve Restaurants",
    };
  }
}
export const updateRestaurant = async (restaurantId, restaurantData) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.put(
      `/restaurant/update-restaurant/${restaurantId}`,
      restaurantData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Restaurant updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Restaurant update failed",
    };
  }
};

export const getRestaurantById = async (restaurantId) => {
  try {
    const response = await apiClient.get(
      `/business/${restaurantId}`,
      {}
    );

    const restaurantData = response.data;


    localStorage.setItem("phone_number",restaurantData.phone_number );


    return {
      success: true,
      data: restaurantData,
      message: "Restaurant data retrieved successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to retrieve restaurant data",
    };
  }
};

// Location API functions
export const getLocation = async (restaurantId) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.get(
      `/location/restaurant-location/${restaurantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
      message: "Location data retrieved successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to retrieve location data",
    };
  }
};

export const createLocation = async (restaurantId, locationData) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.post(
      `/location/restaurant-location/${restaurantId}`,
      locationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Location created successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Location creation failed",
    };
  }
};

export const updateLocation = async (locationId, locationData) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.put(
      `/location/update-location/${locationId}`,
      locationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Location updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Location update failed",
    };
  }
};

export const createMenuItems = async (menuData) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.post("/upload/menu-item", menuData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 201) {
      return {
        success: true,
        data: response.data,
        menuItemId: response.data?.id || response.data?.data?.id,
        message: "Menu saved successfully!",
      };
    }

    return {
      success: false,
      data: response.data,
      message: `Unexpected response status: ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Menu Save failed",
    };
  }
};

export const updateMenuItem = async (menu_item_id, menuData) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.put(
      `/upload/menu-item/${menu_item_id}`,
      menuData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      data: response.data,
      menuItemId: response.data?.id || response.data?.data?.id,
      message: "Menu item updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Menu update failed",
    };
  }
};

export const deleteMenuItem = async (menu_item_id) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.delete(
      `/upload/menu-item/${menu_item_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Menu item deleted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to delete Menu Item",
    };
  }
};

export const getMenuItems = async (restaurant_id) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.get(
      `/upload/menu-items/restaurant/${restaurant_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Menu Items retrieved successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to retrieve Menu Items",
    };
  }
};

export const saveImages = async (menuData) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.post("/upload/images", menuData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      data: response.data,
      menuItemId: response.data?.id || response.data?.data?.id,
      message: "Menu saved successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Menu Save failed",
    };
  }
};

export const deleteMenuItemImage = async (imageId) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.delete(
      `/upload/menu-item/images/${imageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const uploadRestaurantImages = async (formData) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.post(
      `/upload/restaurant-images`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Restaurant images uploaded successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to upload Images",
    };
  }
};

export const getRestaurantImages = async (restaurant_id) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.get(
      `/upload/restaurant-images/${restaurant_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to retrieve Restaurant Images",
    };
  }
};

export const deleteRestaurantLogo = async (restaurant_id) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.delete(
      `/upload/restaurant-images/logo/${restaurant_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Restaurant Logo deleted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to delete Restaurant Logo",
    };
  }
};

export const deleteRestaurantExteriorImage = async (image_id) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.delete(
      `/upload/restaurant-images/exterior/${image_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Restaurant Exterior Image deleted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to delete Restaurant Exterior Image",
    };
  }
};

export const updateRestaurantImage = async (restaurant_id, formData) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await apiClient.put(
      `/upload/restaurant-images/${restaurant_id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Restaurant Images updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to update Restaurant Images",
    };
  }
};

// export const getAllRestaurants = async () => {
//   try {
//     const response = await apiClient.get("/restaurant/list-restaurants", {});

//     return {
//       success: true,
//       data: response.data,
//       message: "All Restaurants retrieved successfully!",
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error,
//       message:
//         error.response?.data?.message ||
//         error.response?.data?.detail ||
//         "Failed to retrieve All Restaurants",
//     };
//   }
// };

// export const getMenuItemsByRestaurantId = async (restaurant_id) => {
//   try {
//     const response = await apiClient.get(
//       `/upload/menu-items/restaurant/${restaurant_id}`,
//       {}
//     );

//     return {
//       success: true,
//       data: response.data,
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error,
//       message:
//         error.response?.data?.message ||
//         error.response?.data?.detail ||
//         "Failed to retrieve Menu Items",
//     };
//   }
// };

export const submitRestaurantReview = async (restaurant_id, rating) => {
  try {
    const response = await apiClient.post(
      `/restaurant/${restaurant_id}/review`,
      { rating },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Restaurant review submitted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to submit restaurant review",
    };
  }
};

export const getRestaurantStats = async (restaurant_number) => {
  try {
    const response = await apiClient2.get(`/stats/${restaurant_number}`, {});
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to retrieve Restaurant Stats",
    };
  }
};
export const getOrders = async ({
  twilio_phone_number,
  status,
  page_size = 10,
  page_no = 1,
} = {}) => {
  try {
    const response = await apiClient2.get("/orders", {
      params: {
        twilio_phone_number,
        status,
        page_size,
        page_no,
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to fetch orders",
    };
  }
};
export const updateOrderStatus = async (order_id, status) => {
  try {
    const response = await apiClient2.put(`/orders/${order_id}`, {
      order_status: status,

    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to update order status",
    };
  }
};
export const updateOrdermenu = async (updatedOrder) => {
  try {

    const response = await apiClient2.put(`/orders/${updatedOrder.id}`,
      updatedOrder

    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to update order status",
    };
  }
};
export const getNote = async (restaurant_id) => {
  try {
    const response = await apiClient.get(`/announcement/${restaurant_id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to retrieve notes",
    };
  }
};
export const createNote = async (note) => {
  try {
    const response = await apiClient.post("/announcement", note);
    return {
      success: true,
      data: response.data,
    };
  }
  catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to create note",
    };
  }
};

export const deleteNote = async (restaurant_id) => {
  try {
    const response = await apiClient.delete(`/announcement/${restaurant_id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error,
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to delete note",
    };
  }
};