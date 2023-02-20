// Decorators
import { EventEmitter, Injectable } from '@angular/core';

// HTTP
import { HttpClient } from '@angular/common/http';

// Environment
import { environment } from 'src/environments/environment';

// Models
import { Cart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartUpdated = new Subject<Cart | undefined>()

  constructor(private http: HttpClient) { }

  getCartSize(): number {
    const cart = this.getCart();
    return cart && cart.products ? cart.products.length : 0
  }

  getCart(): Cart | undefined {
    let val = localStorage.getItem('cart');
    if (val === 'undefined') {
      val = null;
      localStorage.removeItem('cart');
    }
    return val ? JSON.parse(val) as Cart : undefined;
  }

  addToCart(product: Product, user?: User): Cart {
    let cart = this.getCart();
    if (cart) {
      cart.products.push(product);
      cart.user = user
    } else {
      cart = new Cart(0, [product], user);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartUpdated.next(cart);
    return cart;
  }

  removeFromCart(product: Product): Cart | undefined {
    let cart = this.getCart();
    if (cart) {
      const prodAt = cart.products.findIndex(p => p._id === product._id);
      if (prodAt >= 0) cart.products.splice(prodAt, 1);
    }
    if (cart?.products.length === 0) localStorage.removeItem('cart');
    else if (cart) localStorage.setItem('cart', JSON.stringify(cart));
    this.cartUpdated.next(cart);
    return cart;
  }

  // checkout(payload: object): Observable<ServerResponse<object>> {
  //   return this.http.post<ServerResponse<object>>(baseUrl + checkoutEndpoint, payload);
  // }
}
