// Decorators and Lifehooks
import { Component, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

// Router
import { Router } from '@angular/router';

// Forms
import { FormControl, FormGroup, Validators } from '@angular/forms';

// RXJS
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Services
import { CartService } from '../../services/cart.service';
import { HelperService } from '../../services/helper.service';
import { BsModalService } from 'ngx-bootstrap/modal';

// Models
import { Cart } from '../../models/cart.model';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | undefined;
  cartForm: FormGroup | undefined;
  changesSub$: Subscription | undefined;
  removeModalRef: BsModalRef | undefined;
  lastCartState: string | undefined;
  lastDeleteId: string | undefined;
  isComponentIsActive = new Subject();

  constructor(
    private router: Router,
    private cartService: CartService,
    private helperService: HelperService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.cartService
      .getCart()
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
        this.cart = res.data;
        if (this.cart)
          this.cartForm = this.toFormGroup(this.cart.books);
        this.onChanges();
      });
  }

  ngOnDestroy(): void {
    this.changesSub$ ? this.changesSub$.unsubscribe() : null;
    this.isComponentIsActive.complete()
  }

  toFormGroup(books: Book[]): FormGroup {
    const group: any = {};

    books.forEach(book => {
      group[book._id] = new FormControl(
        book.qty || '', [
        Validators.required,
        Validators.min(1),
        Validators.max(20)
      ]);
    });

    return new FormGroup(group);
  }

  onChanges(): void {
    if (!this.cartForm) return;
    this.changesSub$ = this.cartForm
      .valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged()
      )
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(val => {
        if (this.lastCartState !== JSON.stringify(val)) {
          this.lastCartState = JSON.stringify(val);
          this.reCalcSum(val);
        }
      });
  }

  openRemoveModal(template: TemplateRef<any>, id: string): void {
    this.lastDeleteId = id;
    this.removeModalRef = this.modalService.show(
      template,
      { class: 'myModal modal-sm' }
    );
  }

  onRemove(): void {
    if (!this.lastDeleteId) return;
    this.cartService
      .removeFromCart(this.lastDeleteId)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(() => {
        if (!this.cart) return;
        this.helperService.cartStatus.next('remove');
        this.cart.books = this.cart.books.filter(b => b._id !== this.lastDeleteId);
        this.reCalcSum(this.cartForm?.value);
        this.removeModalRef?.hide();
      });
  }

  onSubmit(): void {
    this.cartService
      .checkout(this.cartForm?.value)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(() => {
        this.helperService.cartStatus.next('updateStatus');
        this.router.navigate(['/user/purchaseHistory']);
      });
  }

  reCalcSum(formValues: any): void {
    if (!this.cart) return;
    let price = 0;
    for (const b of this.cart.books) {
      price += b.price * formValues[b._id];
    }

    this.cart.totalPrice = price;
  }

  getControl(id: string) {
    return this.cartForm?.get(id);
  }
}
