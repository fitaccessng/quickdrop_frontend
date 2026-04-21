export const FOOD_CATEGORY_KEYWORDS = [
  "food",
  "meal",
  "meals",
  "restaurant",
  "drink",
  "drinks",
  "beverage",
  "beverages",
  "snack",
  "snacks",
  "bakery",
  "pizza",
  "burger",
  "chicken",
  "shawarma",
  "rice",
  "salad",
];

export const normalizeCategory = (value) => (value ?? "").trim().toLowerCase();

export const isFoodCategory = (value) => {
  const category = normalizeCategory(value);
  return FOOD_CATEGORY_KEYWORDS.some((keyword) => category.includes(keyword));
};

export const getInventoryStats = (products = []) => {
  const totalProducts = products.length;
  const availableProducts = products.filter((product) => product.is_available).length;
  const outOfStockProducts = products.filter((product) => (product.stock_quantity ?? 0) <= 0).length;
  const lowStockProducts = products.filter((product) => {
    const quantity = product.stock_quantity ?? 0;
    const threshold = product.low_stock_threshold ?? 5;
    return quantity > 0 && quantity <= threshold;
  }).length;

  return {
    totalProducts,
    availableProducts,
    outOfStockProducts,
    lowStockProducts,
  };
};

export const getOrderMetrics = (orders = []) => {
  const today = new Date().toDateString();

  return orders.reduce(
    (acc, order) => {
      const status = order.status;
      if (status === "pending") acc.pending += 1;
      if (["confirmed", "preparing", "rider_assigned", "on_the_way"].includes(status)) acc.active += 1;
      if (status === "delivered") acc.completed += 1;
      if (status === "cancelled") acc.cancelled += 1;

      if (new Date(order.created_at).toDateString() === today) {
        acc.dailyRevenue += Number(order.total_amount ?? 0);
      }

      return acc;
    },
    { pending: 0, active: 0, completed: 0, cancelled: 0, dailyRevenue: 0 },
  );
};

export const getPopularProducts = (orders = []) => {
  const productMap = new Map();

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const current = productMap.get(item.product_name) ?? {
        name: item.product_name,
        units: 0,
        revenue: 0,
      };
      current.units += Number(item.quantity ?? 0);
      current.revenue += Number(item.total_price ?? 0);
      productMap.set(item.product_name, current);
    });
  });

  return [...productMap.values()].sort((left, right) => right.units - left.units);
};

export const maskAccountNumber = (value) => {
  if (!value) return "Not added";
  const digits = String(value);
  return `****${digits.slice(-4)}`;
};
