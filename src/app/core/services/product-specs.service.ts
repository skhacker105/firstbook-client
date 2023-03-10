import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HTTPCacheable, HTTPCacheBuster } from '../decorators/cacheable.decorator';
import { ProductSpecification } from '../models/product.model';
import { ServerResponse } from '../models/server-response.model';
import { HelperService } from './helper.service';

const domain = environment.api;
const getProductSpecsEndpoint = domain + 'specs/product/';
const getCategorySpecsEndpoint = domain + 'specs/category/';
const createProductSpecsEndpoint = domain + 'specs/';
const editProductSpecsEndpoint = domain + 'specs/';
const deleteProductSpecsEndpoint = domain + 'specs/';
const specCache$ = new Subject<boolean>();
const logout$ = new Subject<boolean>();

@Injectable({
  providedIn: 'root'
})
export class ProductSpecsService {

  constructor(private http: HttpClient, private helperService: HelperService) {
    this.helperService.isUserLogged.subscribe(res => logout$.next(res));
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: specCache$
  })
  getProductSpecs(productId: string): Observable<ServerResponse<ProductSpecification[]>> {
    return this.http.get<ServerResponse<ProductSpecification[]>>(getProductSpecsEndpoint  + productId);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: specCache$
  })
  getCategoriesSpecs(category: string): Observable<ServerResponse<ProductSpecification[]>> {
    return this.http.get<ServerResponse<ProductSpecification[]>>(getCategorySpecsEndpoint + category);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: specCache$
  })
  createProductSpecs(productId: string, payload: ProductSpecification): Observable<ServerResponse<ProductSpecification>> {
    return this.http.post<ServerResponse<ProductSpecification>>(createProductSpecsEndpoint + productId, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: specCache$
  })
  editProductSpecs(productSpeId: string, payload: ProductSpecification): Observable<ServerResponse<ProductSpecification>> {
    return this.http.put<ServerResponse<ProductSpecification>>(editProductSpecsEndpoint + productSpeId, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: specCache$
  })
  deleteProductSpecs(productSpeId: string): Observable<ServerResponse<ProductSpecification>> {
    return this.http.delete<ServerResponse<ProductSpecification>>(deleteProductSpecsEndpoint + productSpeId);
  }
}
