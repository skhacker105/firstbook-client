import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { map, Observable, of, tap } from 'rxjs';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class LoadUserProductResolver implements Resolve<boolean> {

  constructor(private userService: UserService, private productService: ProductService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.productService.userProducts()
      .pipe(
        tap(res => {
          res.data ? this.userService.loadUserProducts(res.data) : null
        }),
        map(x => true)
      )
  }
}
