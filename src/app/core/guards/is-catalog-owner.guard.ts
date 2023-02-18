import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { HelperService } from '../services/helper.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class IsCatalogOwnerGuard implements CanActivate {

  constructor(private userService: UserService, private helperService: HelperService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.helperService.isAdmin() || this.userService.isOwnerOfCatalog(route.params['catalogId']);
  }

}
