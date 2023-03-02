import { User } from './user.model';
import { Product } from './product.model';
import { ItemImage } from './image';

export class Cart {
  constructor(
    public totalPrice: number,
    public products: CartProduct[],
    public user?: User
  ) { }
}

export class CartProduct {
  constructor(
    public product: Product,
    public cost: number,
    public count: number,
    public image?: ItemImage
  ) {
  }
}
