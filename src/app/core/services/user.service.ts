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
import { Cacheable, CacheBuster } from 'ts-cacheable';

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
const userCache$ = new Subject<void>();

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

  constructor(private http: HttpClient, private productService: ProductService) { }

  @CacheBuster({
    cacheBusterNotifier: userCache$
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


  @Cacheable({
    cacheBusterObserver: userCache$
  })
  getProfile(username: string): Observable<ServerResponse<User>> {
    return this.http.get<ServerResponse<User>>(profileEndpoint + username);
  }

  @CacheBuster({
    cacheBusterNotifier: userCache$
  })
  updateProfile(payload: User): Observable<ServerResponse<any>> {
    return this.http.post<ServerResponse<string>>(updateProfileEndpoint, payload);
  }


  @Cacheable({
    cacheBusterObserver: userCache$
  })
  getPurchaseHistory(): Observable<ServerResponse<Receipt[]>> {
    return this.http.get<ServerResponse<Receipt[]>>(getPurchaseHistoryEndpoint);
  }

  @CacheBuster({
    cacheBusterNotifier: userCache$
  })
  changeAvatar(payload: object): Observable<ServerResponse<object>> {
    return this.http.post<ServerResponse<object>>(changeAvatarEndpoint, payload);
  }

  @CacheBuster({
    cacheBusterNotifier: userCache$
  })
  blockComments(id: string): Observable<ServerResponse<object>> {
    return this.http.post<ServerResponse<object>>(blockCommentsEndpoint + id, {});
  }

  @CacheBuster({
    cacheBusterNotifier: userCache$
  })
  unblockComments(id: string): Observable<ServerResponse<object>> {
    return this.http.post<ServerResponse<object>>(unblockCommentsEndpoint + id, {});
  }


  @Cacheable({
    cacheBusterObserver: userCache$
  })
  search(query: string): Observable<ServerResponse<User[]>> {
    return this.http.get<ServerResponse<User[]>>(userSearchEndpoint + query);
  }
}
