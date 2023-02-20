import { User } from './user.model';
import { Product } from './product.model';

export class Comment {
  constructor(
    public _id: string,
    public user: User,
    public content: string,
    public product?: Product,
    public creationDate?: Date
  ) { }
}
