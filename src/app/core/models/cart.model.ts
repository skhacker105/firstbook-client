import { User } from './user.model';
import { Product } from './product.model';

export class Cart {
  constructor(
    public totalPrice: number,
    public products: Product[],
    public user?: User
  ) { }
}
