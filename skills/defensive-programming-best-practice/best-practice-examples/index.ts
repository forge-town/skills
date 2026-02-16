// ✅ Best Practice: Early Return / Guard Clauses
export function processOrder(order: any) {
  // 1. Validate Input
  if (!order) {
    throw new Error("Invalid order");
  }

  // 2. Validate State (Guard Clauses)
  if (!order.items || order.items.length === 0) {
    return "No items";
  }

  if (!order.isPaid) {
    return "Not paid";
  }

  if (order.isShipped) {
    return "Already shipped";
  }

  // 3. Main Logic (Happy Path)
  console.log("Shipping order...");
  order.isShipped = true;

  return "Shipped";
}
