// Decorators
import { Injectable } from '@angular/core';

// RXJS
import { Observable, Subject } from 'rxjs';

// HTTP
import { HttpClient } from '@angular/common/http';

// Models
import { ServerResponse } from '../models/server-response.model';
import { User } from '../models/user.model';
import { Receipt } from '../models/receipt.model';
import { environment } from 'src/environments/environment';
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
const verifyAndSendOTPEndpoint = baseUrl + '/verifyAndSendOTP';
const verifyOTPEndpoint = baseUrl + '/verifyOTP/';
const resetPasswordEndpoint = baseUrl + '/resetPassword/';
const userSearchEndpoint = baseUrl + '/search';
const userCache$ = new Subject<boolean>();
const logout$ = new Subject<boolean>();

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userProducts: string[] = [];
  private userCatalogs: string[] = [];
  userProductsLoaded = false;
  isComponentIsActive = new Subject();
  titles = ['Mr.', 'Mrs.', 'Miss', 'Ms'];
  userRelationTypes: string[];

  constructor(private http: HttpClient, private helperService: HelperService) {
    this.helperService.isUserLogged.subscribe(res => logout$.next(res));
    this.userRelationTypes = [
      this.helperService.contactTypes.friend,
      this.helperService.contactTypes.vendor,
      this.helperService.contactTypes.client,
      this.helperService.contactTypes.other,
      this.helperService.contactTypes.otherFriend,
      this.helperService.contactTypes.businessContact,
      this.helperService.contactTypes.personalContact,
      this.helperService.contactTypes.hiddenContacts,
      this.helperService.contactTypes.family
    ].sort((a, b) => a > b ? 1 : -1);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: userCache$
  })
  register(payload: object): Observable<ServerResponse<User>> {
    return this.http.post<ServerResponse<User>>(registerEndpoint, payload);
  }

  login(payload: object): Observable<ServerResponse<User>> {
    return this.http.post<ServerResponse<User>>(loginEndpoint, payload);
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

  isOwnerOfCatalog(catalogId: string): boolean {
    return this.userCatalogs.find(c => c === catalogId) ? true : false
  }

  loadUserProducts(productIds: string[]) {
    this.userProducts = productIds;
  }

  loadUserCatalogs(catalogIds: string[]) {
    this.userCatalogs = catalogIds;
  }

  verifyAndSendOTP(payload: object): Observable<ServerResponse<string>> {
    return this.http.post<ServerResponse<string>>(verifyAndSendOTPEndpoint, payload);
  }

  verifyOTP(userId: string, payload: object): Observable<ServerResponse<boolean>> {
    return this.http.post<ServerResponse<boolean>>(verifyOTPEndpoint + userId, payload);
  }

  resetPassword(userId: string, payload: object): Observable<ServerResponse<boolean>> {
    return this.http.post<ServerResponse<boolean>>(resetPasswordEndpoint + userId, payload);
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
