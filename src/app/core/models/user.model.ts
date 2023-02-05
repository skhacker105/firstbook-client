import { Cart } from './cart.model';
import { Book } from './book.model';
import { Receipt } from './receipt.model';

export class User {
  constructor(
    public username: string,
    public avatar: string,
    public isAdmin: boolean,
    public isCommentsBlocked: boolean,
    public _id: string,
    public id: string,
    public commentsCount: number,
    public cart: Cart,
    public favoriteBooks: Book[],
    public receipts: Receipt[],
    public userItems?: string[],
    public firstName?: string,
    public lastName?: string,
    public contact1?: string,
    public contact2?: string,
    public address?: string
  ) { }
}
