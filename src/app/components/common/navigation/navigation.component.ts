// Decorators and Lifehooks
import { Component, OnInit, OnDestroy } from '@angular/core';

// Forms
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Router
import { Router } from '@angular/router';

// RXJS
import { Subject, Subscription, takeUntil } from 'rxjs';

// Services
import { HelperService } from '../../../core/services/helper.service';
import { CartService } from '../../../core/services/cart.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {
  searchForm: FormGroup = new FormGroup({
    'query': new FormControl('', [
      Validators.required
    ])
  });
  isLoggedSub$: Subscription | undefined;
  cartStatusSub$: Subscription | undefined;
  username: string | undefined;
  isLogged: boolean | undefined;
  isAdmin: boolean | undefined;
  cartItems: number | undefined;
  isComponentIsActive = new Subject();

  constructor(
    private router: Router,
    public helperService: HelperService,
    private cartService: CartService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.isLogged = this.helperService.isLoggedIn();
    // this.initForm();
    this.getCartSize();

    this.isLoggedSub$ = this.helperService
      .isUserLogged
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((data) => {
        this.isLogged = data;
      });

    this.cartService.cartUpdated
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(cart => {
        this.cartItems = cart ? cart.products.length : 0;
      })
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete();
    this.isLoggedSub$ ? this.isLoggedSub$.unsubscribe() : null;
    this.cartStatusSub$ ? this.cartStatusSub$.unsubscribe() : null;
  }

  // initForm(): void {
  //   this.searchForm = new FormGroup({
  //     'query': new FormControl('', [
  //       Validators.required
  //     ])
  //   });
  // }

  onSubmit(): void {
    const query: string = this.searchForm.value.query.trim();
    if (query.length !== 0) {
      this.router.navigate([`/book/store/${query}`]);
      this.helperService.searchQuery.next('');
    }
  }

  tick(): void {
    this.isLogged = this.helperService.isLoggedIn();
  }

  isUserLogged(): boolean {
    return this.isLogged ? this.isLogged : false;
  }

  isUserAdmin(): boolean {
    if (!this.isAdmin) {
      this.isAdmin = this.helperService.isAdmin();
    }

    return this.isAdmin;
  }

  getUsername(): void {
    if (!this.username) {
      this.username = this.helperService.getProfile()?.username;
    }
  }

  getCartSize(): void {
    this.cartItems = this.cartService.getCartSize();
  }

  logout(): void {
    this.helperService.isUserLogged
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(loggedIn => !loggedIn ? this.clearOnLogout() : null)
    this.userService.logout();
  }

  clearOnLogout() {
    this.username = undefined;
    this.isAdmin = undefined;
    this.cartItems = undefined;
    this.isLogged = false;
  }
}
