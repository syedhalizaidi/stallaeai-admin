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
