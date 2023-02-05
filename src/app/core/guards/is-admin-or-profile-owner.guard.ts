import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { HelperService } from '../services/helper.service';

@Injectable({
  providedIn: 'root'
})
export class IsAdminOrProfileOwnerGuard implements CanActivate {

  constructor(private helperService: HelperService){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.helperService.getProfile()?.isAdmin || route.params['username'] === this.helperService.getProfile()?.username;
  }
  
}
