export enum OrderStatusType {
    pending = 'Pending',
    waitingFulfillment = 'Waiting for fullfillment',
    waitingShipping = 'Waiting for shipping',
    waitingPickup = 'Waiting for pickup',
    partiallyShipped = 'Partially Shipped',
    shipped = 'Shipped',
    completed = 'Completed',
    cancelled = 'Cancelled',
    declined = 'Declined',
    disputed = 'Disputed',
    manulVerificationRequired = 'Manual verification required',
    blocked = 'Blocked'
}

export enum PaymentStatusType {
    waitingForPayment = 'Waiting for payment',
    waitingForCOD = 'Waiting for cash on delivery',
    partiallyRefunded = 'Partially Refunded',
    refunded = 'Refunded',
    paid = 'Paid'
}