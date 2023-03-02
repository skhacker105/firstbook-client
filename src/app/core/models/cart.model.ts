import { User } from './user.model';
import { OrderAddress, OrderProduct } from './order.model';
import { Payment } from './payment.model';

export class Cart {
  constructor(
    public totalPrice: number,
    public products: OrderProduct[],
    public user?: User,
    public billingAddress?: OrderAddress,
    public shippingAddress?: OrderAddress,
    public paymentInformation?: Payment
  ) { }
}
