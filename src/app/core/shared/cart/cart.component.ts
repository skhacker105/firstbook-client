// Decorators and Lifehooks
import { Component, OnInit, OnDestroy } from '@angular/core';

// Router
import { Router } from '@angular/router';

// RXJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { CartService } from '../../services/cart.service';
import { HelperService } from '../../services/helper.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ProductService } from '../../services/product.service';

// Models
import { Cart } from '../../models/cart.model';
import { User } from '../../models/user.model';
import { OrderProduct } from '../../models/order.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | undefined;
  isComponentIsActive = new Subject();
  loggedInUser: User | undefined;
  catalogProductColumns = ['product', 'name', 'unitprice', 'quantity', 'total', 'action']

  constructor(
    private router: Router,
    private cartService: CartService,
    private helperService: HelperService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.cart = this.cartService.getCart();
    this.loggedInUser = this.helperService.getProfile();
    if (this.cart && this.cart.products) {
      this.loadImages(this.cart.products);
      this.reCalcSum();
    }
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  loadImages(products: OrderProduct[]) {
    let arr = products.forEach(cp => {
      if (cp.product.defaultImage)
        this.productService.getImage(cp.product.defaultImage)
          .pipe(takeUntil(this.isComponentIsActive))
          .subscribe(imgRes => {
            setTimeout(() => {
              if (imgRes.data)
                cp.image = imgRes.data;
            }, 10);
          });
    });
  }

  increaseCount(cartProduct: OrderProduct) {
    this.cartService.addToCart(cartProduct.product, cartProduct.cost, this.loggedInUser);
    cartProduct.count++;
    this.reCalcSum();
  }

  decreaseCount(cartProduct: OrderProduct) {
    this.cartService.updateProductCount(cartProduct.product, cartProduct.count - 1);
    cartProduct.count--;
    if (cartProduct.count === 0) this.removeProduct(cartProduct);
    this.reCalcSum();
  }

  removeProduct(cartProduct: OrderProduct) {
    this.cart = this.cartService.removeFromCart(cartProduct.product);
    if (this.cart) this.loadImages(this.cart.products);
    this.reCalcSum();
  }

  checkout(): void {
    this.router.navigateByUrl('/checkout');
  }

  reCalcSum(): void {
    if (!this.cart || !this.cart.products) return;
    let price = this.cart.products.reduce((s, v) => s + (v.cost * v.count), 0);
    this.cart.totalPrice = price;
    this.cartService.updateTotalPrice(price);
  }
}
