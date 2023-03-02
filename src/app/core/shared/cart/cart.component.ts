// Decorators and Lifehooks
import { Component, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

// Router
import { Router } from '@angular/router';

// Forms
import { FormControl, FormGroup, Validators } from '@angular/forms';

// RXJS
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Services
import { CartService } from '../../services/cart.service';
import { HelperService } from '../../services/helper.service';
import { BsModalService } from 'ngx-bootstrap/modal';

// Models
import { Cart, CartProduct } from '../../models/cart.model';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ItemImage } from '../../models/image';
import { User } from '../../models/user.model';

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
    private modalService: BsModalService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.cart = this.cartService.getCart();
    this.loggedInUser = this.helperService.getProfile();
    if (this.cart && this.cart.products) {
      this.loadImages(this.cart.products);
    }
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  loadImages(products: CartProduct[]) {
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

  increaseCount(cartProduct: CartProduct) {
    this.cartService.addToCart(cartProduct.product, cartProduct.cost, this.loggedInUser);
    cartProduct.count++;
  }

  decreaseCount(cartProduct: CartProduct) {
    this.cartService.updateProductCount(cartProduct.product, cartProduct.count - 1);
    cartProduct.count--;
    if (cartProduct.count === 0) this.removeProduct(cartProduct);
  }

  removeProduct(cartProduct: CartProduct) {
    this.cart = this.cartService.removeFromCart(cartProduct.product);
    if (this.cart) this.loadImages(this.cart.products);
  }

  onSubmit(): void {
    // this.cartService
    //   .checkout(this.cartForm?.value)
    //   .pipe(takeUntil(this.isComponentIsActive)).subscribe(() => {
    //     this.helperService.cartStatus.next('updateStatus');
    //     this.router.navigate(['/user/purchaseHistory']);
    //   });
  }

  reCalcSum(formValues: any): void {
    // if (!this.cart || !this.cart.books) return;
    // let price = 0;
    // for (const b of this.cart.books) {
    //   price += b.price * formValues[b._id];
    // }

    // this.cart.totalPrice = price;
  }
}
