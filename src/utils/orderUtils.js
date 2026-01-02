export const getOrderTotal = (order) => {
  if (!order) return 0;

  let details = order.order_details;

  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch (e) {
      return parseFloat(order.total_amount) || 0;
    }
  }

  if (details && typeof details === 'object') {
    if ('subtotal' in details && 'tax' in details && 'total' in details) {
      return parseFloat(details.total) || 0;
    }
  }

  return parseFloat(order.total_amount) || 0;
};

export const getOrderBreakdown = (order) => {
  if (!order) return { subtotal: null, tax: null, total: 0 };

  let details = order.order_details;
  let subtotal = null;
  let tax = null;
  let total = parseFloat(order.total_amount) || 0;

  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch (e) {
      return { subtotal, tax, total };
    }
  }

  if (details && typeof details === 'object') {
    if ('subtotal' in details) subtotal = parseFloat(details.subtotal);
    if ('tax' in details) tax = parseFloat(details.tax);
    if ('total' in details) total = parseFloat(details.total);
  }

  return { subtotal, tax, total };
};

export const normalizeTimestamp = (timestamp) => {
  if (!timestamp) return null;

  let cleanTimestamp = timestamp.toString().trim();
  
  if (cleanTimestamp.includes('Z') && (cleanTimestamp.includes('+') || cleanTimestamp.includes('-'))) {
    cleanTimestamp = cleanTimestamp.replace(/Z$/, '').replace(/\+00:00$/, '') + 'Z';
  } else if (cleanTimestamp.includes('+00:00') && !cleanTimestamp.includes('Z')) {
    cleanTimestamp = cleanTimestamp.replace(/\+00:00$/, 'Z');
  }

  const date = new Date(cleanTimestamp);
  if (isNaN(date.getTime())) {
    const parts = cleanTimestamp.split(/[+-]/);
    if (parts.length > 1 && parts[0].length > 10) {
      const fallbackDate = new Date(parts[0] + 'Z');
      if (!isNaN(fallbackDate.getTime())) return fallbackDate;
    }
    return null;
  }
  
  return date;
};

export const formatRelativeTime = (timestamp) => {
  const date = normalizeTimestamp(timestamp);
  if (!date) return "Invalid Date";

  const now = new Date();
  const diffMs = now - date;
  
  if (diffMs < 0) return "Just now";

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleString([], { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
