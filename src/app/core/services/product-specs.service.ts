import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { ProductSpecification } from '../models/product.model';
import { ServerResponse } from '../models/server-response.model';

const domain = environment.api;
const getProductSpecsEndpoint = domain + 'specs/product/';
const getCategorySpecsEndpoint = domain + 'specs/category/';
const createProductSpecsEndpoint = domain + 'specs/';
const editProductSpecsEndpoint = domain + 'specs/';
const deleteProductSpecsEndpoint = domain + 'specs/';
const specCache$ = new Subject<void>();

@Injectable({
  providedIn: 'root'
})
export class ProductSpecsService {

  constructor(private http: HttpClient) { }

  @Cacheable({
    cacheBusterObserver: specCache$
  })
  getProductSpecs(productId: string): Observable<ServerResponse<ProductSpecification[]>> {
    return this.http.get<ServerResponse<ProductSpecification[]>>(getProductSpecsEndpoint  + productId);
  }

  @Cacheable({
    cacheBusterObserver: specCache$
  })
  getCategoriesSpecs(category: string): Observable<ServerResponse<ProductSpecification[]>> {
    return this.http.get<ServerResponse<ProductSpecification[]>>(getCategorySpecsEndpoint + category);
  }

  @CacheBuster({
    cacheBusterNotifier: specCache$
  })
  createProductSpecs(productId: string, payload: ProductSpecification): Observable<ServerResponse<ProductSpecification>> {
    return this.http.post<ServerResponse<ProductSpecification>>(createProductSpecsEndpoint + productId, payload);
  }

  @CacheBuster({
    cacheBusterNotifier: specCache$
  })
  editProductSpecs(productSpeId: string, payload: ProductSpecification): Observable<ServerResponse<ProductSpecification>> {
    return this.http.put<ServerResponse<ProductSpecification>>(editProductSpecsEndpoint + productSpeId, payload);
  }

  @CacheBuster({
    cacheBusterNotifier: specCache$
  })
  deleteProductSpecs(productSpeId: string): Observable<ServerResponse<ProductSpecification>> {
    return this.http.delete<ServerResponse<ProductSpecification>>(deleteProductSpecsEndpoint + productSpeId);
  }
}
