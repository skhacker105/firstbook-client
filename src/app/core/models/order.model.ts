import { OrderStatusType, PaymentStatusType } from "../utilities/constants";
import { ItemImage } from "./image";
import { Payment } from "./payment.model";
import { Product } from "./product.model";

export class Order {
  constructor(
    public _id: string,
    public totalPrice: number,
    public products: OrderProduct[],
    public billingAddress?: OrderAddress,
    public shippingAddress?: OrderAddress,
    public currentStatus?: OrderStatus,
    public statusHistory?: OrderStatus[],
    public currentPaymentStatus?: OrderPaymentStatus,
    public paymentStatusHistory?: OrderPaymentStatus[],
    public createdBy?: string,
    public creationDate?: Date
  ) { }
}

export class OrderProduct {
  constructor(
    public product: Product,
    public cost: number,
    public count: number,
    public image?: ItemImage,
    public _id?: string,
    public createdBy?: string,
    public creationDate?: Date
  ) {
  }
}

export class OrderAddress {
  constructor(
    public address: string,
    public contact: string
  ) { }
}

export class OrderStatus {
  constructor(
    public status: OrderStatusType,
    public createdBy?: string,
    public creationDate?: Date
  ) { }
}

export class OrderPaymentStatus {
  constructor(
    public status: PaymentStatusType,
    public payment?: Payment,
    public createdBy?: string,
    public creationDate?: Date
  ) { }
}