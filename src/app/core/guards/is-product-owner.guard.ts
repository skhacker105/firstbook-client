import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { HelperService } from '../services/helper.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class IsProductOwnerGuard implements CanLoad, CanActivate {

  constructor(private userService: UserService, private helperService: HelperService) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.helperService.isAdmin() || this.userService.isOwnerOfProduct(route.params['productId']);
  }
}
