import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ItemImage } from '../models/image';
import { Product } from '../models/product.model';
import { ServerResponse } from '../models/server-response.model';
import { Comment } from '../models/comment.model';
import { Cacheable, CacheBuster } from 'ts-cacheable';

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
const productCache$ = new Subject<void>();
const productCommentCache$ = new Subject<void>();


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  @Cacheable({
    cacheBusterObserver: productCache$
  })
  userProducts(): Observable<ServerResponse<string[]>> {
    return this.http.get<ServerResponse<string[]>>(userProductEndpoint);
  }

  @CacheBuster({
    cacheBusterNotifier: productCache$
  })
  enableProduct(id: string): Observable<ServerResponse<Product>> {
    return this.http.get<ServerResponse<Product>>(enableProductEndpoint + id);
  }

  @CacheBuster({
    cacheBusterNotifier: productCache$
  })
  disableProduct(id: string): Observable<ServerResponse<Product>> {
    return this.http.get<ServerResponse<Product>>(disableProductEndpoint + id);
  }

  @Cacheable({
    cacheBusterObserver: productCache$
  })
  getSingleProduct(id: string): Observable<ServerResponse<Product>> {
    return this.http.get<ServerResponse<Product>>(getSingleProductEndpoint + id);
  }

  @CacheBuster({
    cacheBusterNotifier: productCache$
  })
  createProduct(payload: Product): Observable<ServerResponse<Product>> {
    return this.http.post<ServerResponse<Product>>(createProductEndpoint, payload);
  }

  @CacheBuster({
    cacheBusterNotifier: productCache$
  })
  editProduct(id: string, payload: Product): Observable<ServerResponse<Product>> {
    return this.http.put<ServerResponse<Product>>(editProductEndpoint + id, payload);
  }

  @CacheBuster({
    cacheBusterNotifier: productCache$
  })
  deleteProduct(id: string): Observable<ServerResponse<Product>> {
    return this.http.delete<ServerResponse<Product>>(deleteProductEndpoint + id);
  }

  @CacheBuster({
    cacheBusterNotifier: productCache$
  })
  rateProduct(id: string, payload: object): Observable<ServerResponse<Product>> {
    return this.http.post<ServerResponse<Product>>(rateProductEndpoint + id, payload);
  }

  @CacheBuster({
    cacheBusterNotifier: productCache$
  })
  saveImage(product: Product, payload: ItemImage): Observable<ServerResponse<string>> {
    const profileData = new FormData();
    profileData.append('productId', product._id);
    profileData.append('name', payload.name);
    profileData.append('image', payload.image);

    return this.http.post<ServerResponse<string>>(saveImageEndpoint, profileData);
  }

  @CacheBuster({
    cacheBusterNotifier: productCache$
  })
  deleteImage(pictureId: string): Observable<ServerResponse<any>> {
    return this.http.delete<ServerResponse<any>>(deleteImageEndpoint + pictureId);
  }

  @CacheBuster({
    cacheBusterNotifier: productCache$
  })
  saveMainImage(product: Product, payload: ItemImage): Observable<ServerResponse<any>> {
    const profileData = new FormData();
    profileData.append('productId', product._id);
    profileData.append('name', payload.name);
    profileData.append('image', payload.image);
    return this.http.post<ServerResponse<any>>(saveMainImageEndpoint, profileData);
  }

  @CacheBuster({
    cacheBusterNotifier: productCache$
  })
  deleteMainImage(product: Product): Observable<ServerResponse<any>> {
    return this.http.delete<ServerResponse<any>>(deleteMainImageEndpoint + product._id);
  }

  @Cacheable({
    cacheBusterObserver: productCache$
  })
  getImage(imageId: string): Observable<ServerResponse<ItemImage>> {
    return this.http.get<ServerResponse<ItemImage>>(getImageEndpoint + imageId);
  }

  @Cacheable({
    cacheBusterObserver: productCache$
  })
  search(query: string): Observable<ServerResponse<string[]>> {
    return this.http.get<ServerResponse<string[]>>(searchProductEndpoint + query);
  }

  @Cacheable({
    cacheBusterObserver: productCommentCache$
  })
  getComments(id: string, page: string): Observable<ServerResponse<Comment[]>> {
    return this.http.get<ServerResponse<Comment[]>>(getCommentEndpoint + `${id}/${page}`);
  }

  @CacheBuster({
    cacheBusterNotifier: productCommentCache$
  })
  addComment(id: string, payload: Comment): Observable<ServerResponse<Comment>> {
    return this.http.post<ServerResponse<Comment>>(addCommentEndpoint + id, payload);
  }

  @CacheBuster({
    cacheBusterNotifier: productCommentCache$
  })
  editComment(id: string, payload: Comment): Observable<ServerResponse<Comment>> {
    return this.http.put<ServerResponse<Comment>>(editCommentEndpoint + id, payload);
  }

  @CacheBuster({
    cacheBusterNotifier: productCommentCache$
  })
  deleteComment(id: string): Observable<ServerResponse<object>> {
    return this.http.delete<ServerResponse<object>>(deleteCommentEndpoint + id);
  }
}
