// Decorators
import { Injectable } from '@angular/core';

// RXJS
import { map, Observable, Subject, takeUntil } from 'rxjs';

// HTTP
import { HttpClient } from '@angular/common/http';

// Models
import { ServerResponse } from '../models/server-response.model';
import { User } from '../models/user.model';
import { Receipt } from '../models/receipt.model';
import { environment } from 'src/environments/environment';
import { ProductService } from './product.service';
import { HTTPCacheable, HTTPCacheBuster } from '../decorators/cacheable.decorator';
import { HelperService } from './helper.service';

const baseUrl = environment.api + 'user';
const registerEndpoint = baseUrl + '/register';
const loginEndpoint = baseUrl + '/login';
const profileEndpoint = baseUrl + '/profile/';
const updateProfileEndpoint = baseUrl + '/profile';
const getPurchaseHistoryEndpoint = baseUrl + '/purchaseHistory';
const changeAvatarEndpoint = baseUrl + '/changeAvatar';
const blockCommentsEndpoint = baseUrl + '/blockComments/';
const unblockCommentsEndpoint = baseUrl + '/unlockComments/';
const userSearchEndpoint = baseUrl + '/search';
const userCache$ = new Subject<boolean>();
const logout$ = new Subject<boolean>();

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userProducts: string[] = [];
  userProductsLoaded = false;
  isComponentIsActive = new Subject();
  titles = ['Mr.', 'Mrs.', 'Miss', 'Ms'];
  userRelationTypes = [
    'Friend', 'Vendor', 'Client', 'Other', 'Other Friend',
    'Business contacts', 'Personal Contacts', 'Hidden Contacts',
    'Family'].sort((a, b) => a > b ? 1 : -1);

  constructor(private http: HttpClient, private productService: ProductService, private helperService: HelperService) {
    this.helperService.isUserLogged.subscribe(res => logout$.next(res));
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: userCache$
  })
  register(payload: object): Observable<ServerResponse<User>> {
    return this.http.post<ServerResponse<User>>(registerEndpoint, payload);
  }

  login(payload: object): Observable<ServerResponse<User>> {
    return this.http.post<ServerResponse<User>>(loginEndpoint, payload)
      .pipe(map(userRes => {
        userRes.data ? this.loadUserProducts(userRes.data) : null;
        return userRes;
      }));
  }

  logout() {
    this.userProducts = [];
    this.helperService.clearSession();
    this.helperService.isUserLogged.next(false);
  }
  getProducts() {
    return this.userProducts;
  }

  isOwnerOfProduct(productId: string): boolean {
    return this.userProducts.find(p => p === productId) ? true : false
  }

  loadUserProducts(user: User) {
    this.productService
      .userProducts()
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(productsRes => {
        this.userProductsLoaded = true;
        if (productsRes.data)
          this.userProducts = productsRes.data
      });
  }


  @HTTPCacheable({
    logoutEvent: logout$, refresher: userCache$
  })
  getProfile(username: string): Observable<ServerResponse<User>> {
    return this.http.get<ServerResponse<User>>(profileEndpoint + username);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: userCache$
  })
  updateProfile(payload: User): Observable<ServerResponse<any>> {
    return this.http.post<ServerResponse<string>>(updateProfileEndpoint, payload);
  }


  @HTTPCacheable({
    logoutEvent: logout$, refresher: userCache$
  })
  getPurchaseHistory(): Observable<ServerResponse<Receipt[]>> {
    return this.http.get<ServerResponse<Receipt[]>>(getPurchaseHistoryEndpoint);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: userCache$
  })
  changeAvatar(payload: object): Observable<ServerResponse<object>> {
    return this.http.post<ServerResponse<object>>(changeAvatarEndpoint, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: userCache$
  })
  blockComments(id: string): Observable<ServerResponse<object>> {
    return this.http.post<ServerResponse<object>>(blockCommentsEndpoint + id, {});
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: userCache$
  })
  unblockComments(id: string): Observable<ServerResponse<object>> {
    return this.http.post<ServerResponse<object>>(unblockCommentsEndpoint + id, {});
  }


  @HTTPCacheable({
    logoutEvent: logout$, refresher: userCache$
  })
  search(query: string): Observable<ServerResponse<User[]>> {
    return this.http.get<ServerResponse<User[]>>(userSearchEndpoint + query);
  }
}
