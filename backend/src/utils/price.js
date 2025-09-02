export function computeOrderTotals(items){
const subtotal = items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
const tax = +(subtotal * 0.05).toFixed(2); // 5% example
const serviceCharge = +(subtotal * 0.07).toFixed(2); // 7% example
const grandTotal = +(subtotal + tax + serviceCharge).toFixed(2);
return { subtotal, tax, serviceCharge, grandTotal };
}