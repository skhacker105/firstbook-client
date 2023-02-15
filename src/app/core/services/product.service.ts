import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ItemImage } from '../models/image';
import { Product } from '../models/product.model';
import { ServerResponse } from '../models/server-response.model';
import { Comment } from '../models/comment.model';
import { HTTPCacheable, HTTPCacheBuster } from '../decorators/cacheable.decorator';
import { HelperService } from './helper.service';

const domain = environment.api;
const userProductEndpoint = domain + 'userproducts';
const enableProductEndpoint = domain + 'product/enable/';
const disableProductEndpoint = domain + 'product/disable/';
const getSingleProductEndpoint = domain + 'product/details/';
const createProductEndpoint = domain + 'product/add';
const editProductEndpoint = domain + 'product/edit/';
const deleteProductEndpoint = domain + 'product/delete/';
const rateProductEndpoint = domain + 'product/rate/';
const searchProductEndpoint = domain + 'product/search';

const saveImageEndpoint = domain + 'product/gallery';
const deleteImageEndpoint = domain + 'product/gallery/';
const saveMainImageEndpoint = domain + 'product/picture';
const deleteMainImageEndpoint = domain + 'product/picture/';
const getImageEndpoint = domain + 'picture/';

const getCommentEndpoint = domain + 'product/comment/';
const addCommentEndpoint = domain + 'product/comment/add/';
const editCommentEndpoint = domain + 'product/comment/edit/';
const deleteCommentEndpoint = domain + 'product/comment/delete/';

const productCache$ = new Subject<boolean>();
const productCommentCache$ = new Subject<boolean>();
const logout$ = new Subject<boolean>();


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient, private helperService: HelperService) {
    this.helperService.isUserLogged.subscribe(res => logout$.next(res));
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: productCache$
  })
  userProducts(): Observable<ServerResponse<string[]>> {
    return this.http.get<ServerResponse<string[]>>(userProductEndpoint);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCache$
  })
  enableProduct(id: string): Observable<ServerResponse<Product>> {
    return this.http.get<ServerResponse<Product>>(enableProductEndpoint + id);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCache$
  })
  disableProduct(id: string): Observable<ServerResponse<Product>> {
    return this.http.get<ServerResponse<Product>>(disableProductEndpoint + id);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: productCache$
  })
  getSingleProduct(id: string): Observable<ServerResponse<Product>> {
    return this.http.get<ServerResponse<Product>>(getSingleProductEndpoint + id);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCache$
  })
  createProduct(payload: Product): Observable<ServerResponse<Product>> {
    return this.http.post<ServerResponse<Product>>(createProductEndpoint, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCache$
  })
  editProduct(id: string, payload: Product): Observable<ServerResponse<Product>> {
    return this.http.put<ServerResponse<Product>>(editProductEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCache$
  })
  deleteProduct(id: string): Observable<ServerResponse<Product>> {
    return this.http.delete<ServerResponse<Product>>(deleteProductEndpoint + id);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCache$
  })
  rateProduct(id: string, payload: object): Observable<ServerResponse<Product>> {
    return this.http.post<ServerResponse<Product>>(rateProductEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCache$
  })
  saveImage(product: Product, payload: ItemImage): Observable<ServerResponse<string>> {
    const profileData = new FormData();
    profileData.append('productId', product._id);
    profileData.append('name', payload.name);
    profileData.append('image', payload.image);

    return this.http.post<ServerResponse<string>>(saveImageEndpoint, profileData);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCache$
  })
  deleteImage(pictureId: string): Observable<ServerResponse<any>> {
    return this.http.delete<ServerResponse<any>>(deleteImageEndpoint + pictureId);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCache$
  })
  saveMainImage(product: Product, payload: ItemImage): Observable<ServerResponse<any>> {
    const profileData = new FormData();
    profileData.append('productId', product._id);
    profileData.append('name', payload.name);
    profileData.append('image', payload.image);
    return this.http.post<ServerResponse<any>>(saveMainImageEndpoint, profileData);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCache$
  })
  deleteMainImage(product: Product): Observable<ServerResponse<any>> {
    return this.http.delete<ServerResponse<any>>(deleteMainImageEndpoint + product._id);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: productCache$
  })
  getImage(imageId: string): Observable<ServerResponse<ItemImage>> {
    return this.http.get<ServerResponse<ItemImage>>(getImageEndpoint + imageId);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: productCache$
  })
  search(query: string): Observable<ServerResponse<string[]>> {
    return this.http.get<ServerResponse<string[]>>(searchProductEndpoint + query);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: productCommentCache$
  })
  getComments(id: string, page: string): Observable<ServerResponse<Comment[]>> {
    return this.http.get<ServerResponse<Comment[]>>(getCommentEndpoint + `${id}/${page}`);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCommentCache$
  })
  addComment(id: string, payload: Comment): Observable<ServerResponse<Comment>> {
    return this.http.post<ServerResponse<Comment>>(addCommentEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCommentCache$
  })
  editComment(id: string, payload: Comment): Observable<ServerResponse<Comment>> {
    return this.http.put<ServerResponse<Comment>>(editCommentEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: productCommentCache$
  })
  deleteComment(id: string): Observable<ServerResponse<object>> {
    return this.http.delete<ServerResponse<object>>(deleteCommentEndpoint + id);
  }
}
