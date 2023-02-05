// Decorators and Lifehooks
import { Component, OnInit, OnDestroy } from '@angular/core';

// Forms
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Router
import { Router } from '@angular/router';

// RXJS
import { Subscription } from 'rxjs';

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
  statusChecker: number | undefined;
  cartItems: number | undefined;

  constructor(
    private router: Router,
    private helperService: HelperService,
    private cartService: CartService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.statusChecker = window.setInterval(() => this.tick(), 600000);
    this.isLogged = this.helperService.isLoggedIn();
    // this.initForm();
    if (this.isLogged) {
      this.getCartSize();
    }

    this.isLoggedSub$ = this.helperService
      .isUserLogged
      .subscribe((data) => {
        this.isLogged = data;
      });

    this.cartStatusSub$ = this.helperService
      .cartStatus
      .subscribe((data) => {
        if (data === 'add') {
          this.cartItems ? this.cartItems++ : this.cartItems = 1;
        } else if (data === 'remove') {
          this.cartItems ? this.cartItems-- : this.cartItems = 0;
        } else if (data === 'updateStatus') {
          this.getCartSize();
        }
      });
  }

  ngOnDestroy(): void {
    window.clearInterval(this.statusChecker);
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
    this.cartService
      .getCartSize()
      .subscribe((res) => {
        this.cartItems = res.data ? res.data : 0;
      });
  }

  logout(): void {
    this.username = undefined;
    this.isAdmin = undefined;
    this.cartItems = undefined;
    this.userService.logout();
    this.helperService.clearSession();
    this.helperService.isUserLogged.next(false);
  }
}
