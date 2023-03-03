import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Cart } from 'src/app/core/models/cart.model';
import { Payment } from 'src/app/core/models/payment.model';
import { User } from 'src/app/core/models/user.model';
import { CartService } from 'src/app/core/services/cart.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class CheckoutComponent implements OnInit, OnDestroy {

  step = 0;
  copy = false;
  cart: Cart | undefined;
  loggedInUser: User | undefined;
  isComponentIsActive = new Subject();
  isMobileView = false;
  copyContactSubscription$: Subscription | undefined;
  copyAddressSubscription$: Subscription | undefined;
  addressForm: FormGroup | undefined;
  paymentForm: FormGroup | undefined;
  totalCount = 0;
  @ViewChild('stepper') stepper!: MatStepper;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private helperService: HelperService,
    private cartService: CartService,
    public paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    let step = this.route.snapshot.paramMap.get('step');
    this.step = step ? +step : 0;
    this.cart = this.cartService.getCart();
    this.loggedInUser = this.helperService.getProfile();
    this.isMobileView = window.innerWidth < 500 ? true : false;
    this.initAllFormsGroups();
    this.countItems();
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete();
    this.copyContactSubscription$ ? this.copyContactSubscription$.unsubscribe() : null;
    this.copyAddressSubscription$ ? this.copyAddressSubscription$.unsubscribe() : null;
  }

  initAllFormsGroups() {
    this.addressForm = this.fb.group({
      shippingAddress: new FormControl(this.cart?.shippingAddress?.address, Validators.required),
      shippingContact: new FormControl(this.cart?.shippingAddress?.contact, Validators.required),
      bilingAddress: new FormControl(this.cart?.billingAddress?.address, Validators.required),
      bilingContact: new FormControl(this.cart?.billingAddress?.contact, Validators.required)
    });
    this.mapUserAddress();
    this.checkIfShippingAndBillingAddrSame();
    this.paymentForm = this.fb.group({
      paymentService: new FormControl(this.cart?.paymentInformation as Payment, Validators.required)
    });
  }

  checkIfShippingAndBillingAddrSame() {
    if (!this.addressForm) return;
    let bilingAddress = this.addressForm.controls['bilingAddress'].value;
    let bilingContact = this.addressForm.controls['bilingContact'].value;
    let shippingContact = this.addressForm.controls['shippingContact'].value;
    let shippingAddress = this.addressForm.controls['shippingAddress'].value;
    if (bilingAddress === shippingAddress && bilingContact === shippingContact) {
      this.copy = true;
      this.handleCopyChange();
    }
  }

  countItems() {
    if (!this.cart) return;
    this.totalCount = this.cart.products.reduce((s, v) => s + v.count, 0);
  }

  mapUserAddress() {
    if (!this.addressForm) return;
    let user: User | undefined;
    if (this.loggedInUser) {
      user = this.loggedInUser;
      if (this.cart && !this.cart.user) this.cart.user = user;
    }
    else if (this.cart?.user) user = this.cart.user;
    if (user) {
      this.addressForm.controls['bilingAddress'].setValue(user.address ? user.address : '');
      this.addressForm.controls['shippingAddress'].setValue(user.address ? user.address : '');
      this.addressForm.controls['shippingContact'].setValue(user.contact1 ? user.contact1 : user.contact2 ? user.contact2 : '');
      this.addressForm.controls['bilingContact'].setValue(user.contact1 ? user.contact1 : user.contact2 ? user.contact2 : '');
    }
    if (this.cart) {
      this.cartService.setNewCart(this.cart);
    }
  }

  handleCopyChange() {
    if (!this.addressForm) return;

    let bilingAddress = this.addressForm.controls['bilingAddress'];
    let bilingContact = this.addressForm.controls['bilingContact'];
    let shippingContact = this.addressForm.controls['shippingContact'];
    let shippingAddress = this.addressForm.controls['shippingAddress'];

    this.copyContactSubscription$ ? this.copyContactSubscription$.unsubscribe() : null;
    this.copyAddressSubscription$ ? this.copyAddressSubscription$.unsubscribe() : null;
    bilingContact.setValue('');
    bilingAddress.setValue('');

    if (!this.copy) {
      bilingContact.enable();
      bilingAddress.enable();
    } else {
      bilingContact.setValue(shippingContact.value);
      bilingAddress.setValue(shippingAddress.value);
      this.copyContactSubscription$ = shippingContact.valueChanges
        .pipe(takeUntil(this.isComponentIsActive))
        .subscribe(res => {
          if (this.addressForm) bilingContact.setValue(res);
        });
      this.copyAddressSubscription$ = shippingAddress.valueChanges
        .pipe(takeUntil(this.isComponentIsActive))
        .subscribe(res => {
          if (this.addressForm) bilingAddress.setValue(res);
        });
      bilingContact.disable();
      bilingAddress.disable();
    }
  }

  mapAddressToCart() {
    if (!this.addressForm || this.addressForm.invalid || !this.cart) return;
    const formValue = this.addressForm.getRawValue();
    this.cart.billingAddress = {
      address: formValue.bilingAddress,
      contact: formValue.bilingContact
    }
    this.cart.shippingAddress = {
      address: formValue.shippingAddress,
      contact: formValue.shippingContact
    }
  }

  redirectToLogin() {
    this.helperService.setCallBack('/checkout/1');
    this.router.navigateByUrl('/user/login');
  }

  redirectToRegister() {
    this.helperService.setCallBack('/checkout/1');
    this.router.navigateByUrl('/user/register');
  }

  mapPaymentInformation() {
    if (!this.paymentForm || this.paymentForm.invalid || !this.cart) return;
    let selectedPayment = this.paymentForm.value.paymentService;
    this.cart.paymentInformation = this.paymentService.lstPaymentServices.find(ps => ps.mode === selectedPayment._mode)
    this.cartService.setNewCart(this.cart);
    if (this.cart.paymentInformation)
      this.paymentService.makePayment(this.cart.paymentInformation.getPaymentURL(), this.cart)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(order => {
        console.log('order = ', order)
      })
  }

}
