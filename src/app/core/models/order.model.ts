import { ItemImage } from "./image";
import { Payment } from "./payment.model";
import { Product } from "./product.model";
import { User } from "./user.model";

export class Order {
    constructor(
        public _id: string,
        public totalPrice: number,
        public products: OrderProduct[],
        public user?: User,
        public billingAddress?: OrderAddress,
        public shippingAddress?: OrderAddress,
        public paymentInformation?: Payment
    ) { }
}

export class OrderProduct {
  constructor(
    public product: Product,
    public cost: number,
    public count: number,
    public image?: ItemImage
  ) {
  }
}

export class OrderAddress {
    constructor(
        public address: string,
        public contact: string
    ) { }
}