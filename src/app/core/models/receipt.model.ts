import { Product } from './product.model';
import { User } from './user.model';

export class Receipt {
  constructor(
    public user: User,
    public productsInfo: Product[],
    public totalPrice: number
  ) { }
}
