// ❌ Bad Practice: Deep Nesting
export function processOrder(order: any) {
  if (order) {
    if (order.items && order.items.length > 0) {
      if (order.isPaid) {
        if (!order.isShipped) {
          // Main logic buried deep inside
          console.log("Shipping order...");
          order.isShipped = true;
          return "Shipped";
        } else {
          return "Already shipped";
        }
      } else {
        return "Not paid";
      }
    } else {
      return "No items";
    }
  } else {
    throw new Error("Invalid order");
  }
}
