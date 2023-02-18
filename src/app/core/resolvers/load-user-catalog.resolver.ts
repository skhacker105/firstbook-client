import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { map, Observable, of, tap } from 'rxjs';
import { CatalogService } from '../services/catalog.service';
import { HelperService } from '../services/helper.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class LoadUserCatalogResolver implements Resolve<boolean> {

  constructor(
    private userService: UserService,
    private catalogService: CatalogService,
    private helperService: HelperService
    ) { }
    
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (!this.helperService.isLoggedIn()) return of(true)
    return this.catalogService.userCatalogs()
      .pipe(
        tap(res => {
          res.data ? this.userService.loadUserCatalogs(res.data) : null
        }),
        map(x => true)
      );
  }
}
