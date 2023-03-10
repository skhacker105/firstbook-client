import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HTTPCacheable, HTTPCacheBuster } from '../decorators/cacheable.decorator';
import { Catalog } from '../models/catalog.model';
import { ItemImage } from '../models/image';
import { ServerResponse } from '../models/server-response.model';
import { HelperService } from './helper.service';

const domain = environment.api;
const downloadCatalAsExcelEndpoint = domain + 'catalog/downloadCatalAsExcel/';
const downloadCatalAsPDFEndpoint = domain + 'catalog/downloadCatalAsPDF/';
const uploadCatalogBannerEndpoint = domain + 'catalog/banner/';
const getCatalogBannerEndpoint = domain + 'catalog/banner/';
const userCatalogsEndpoint = domain + 'catalog/usercatalogs';
const singleCatalogEndpoint = domain + 'catalog/getSingle/';
const addCatalogEndpoint = domain + 'catalog/add';
const enableCatalogEndpoint = domain + 'catalog/enable/';
const disableCatalogEndpoint = domain + 'catalog/disable/';
const editCatalogEndpoint = domain + 'catalog/edit/';
const updateProductCostEndpoint = domain + 'catalog/updateProductCost';
const searchEndpoint = domain + 'catalog/search';
const catalogCache$ = new Subject<boolean>();
const catalogBannerCache$ = new Subject<boolean>();
const logout$ = new Subject<boolean>();

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private http: HttpClient, private helperService: HelperService) {
    this.helperService.isUserLogged.subscribe(res => logout$.next(res));
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: catalogCache$
  })
  getSingleCatalog(id: string): Observable<ServerResponse<Catalog>> {
    return this.http.get<ServerResponse<Catalog>>(singleCatalogEndpoint + id)
      .pipe(map(res => {
        if (res.data) {
          res.data.products = res.data.products.filter(p => !p.product.disabled)
          res.data.products.forEach(cp => {
              cp.product.clientCosts = cp.product.clientCosts?.filter(cc => cc.client ? true : false);
          });
        }
        return res;
      }));
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: catalogCache$
  })
  userCatalogs(): Observable<ServerResponse<string[]>> {
    return this.http.get<ServerResponse<string[]>>(userCatalogsEndpoint);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: catalogCache$
  })
  downloadCatalogAsExcel(catalogId: string): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    return this.http.get(downloadCatalAsExcelEndpoint + catalogId, { headers, responseType: 'blob' });
  }


  

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: catalogBannerCache$
  })
  saveBanner(id: string, payload: ItemImage): Observable<ServerResponse<boolean>> {
    const profileData = new FormData();
    profileData.append('image', payload.image);
    return this.http.post<ServerResponse<boolean>>(uploadCatalogBannerEndpoint + id, profileData);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: catalogBannerCache$
  })
  getBanner(id: string): Observable<ServerResponse<ItemImage>> {
    return this.http.get<ServerResponse<ItemImage>>(uploadCatalogBannerEndpoint + id);
  }


  @HTTPCacheable({
    logoutEvent: logout$, refresher: catalogCache$
  })
  downloadCatalogAsPDF(catalogId: string, clientId?: string) {
    const headers = new HttpHeaders({
      "Content-Type": "application/pdf"
    });
    return this.http.get(downloadCatalAsPDFEndpoint + catalogId + (clientId ? '/' + clientId : ''), { headers, responseType: 'blob' });
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: catalogCache$
  })
  createCatalog(payload: any): Observable<ServerResponse<Catalog>> {
    return this.http.post<ServerResponse<Catalog>>(addCatalogEndpoint, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: catalogCache$
  })
  editCatalog(id: string, payload: any): Observable<ServerResponse<Catalog>> {
    return this.http.put<ServerResponse<Catalog>>(editCatalogEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: catalogCache$
  })
  updateProductCost(payload: any): Observable<ServerResponse<Catalog>> {
    return this.http.put<ServerResponse<Catalog>>(updateProductCostEndpoint, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: catalogCache$
  })
  enableCatalog(id: string): Observable<ServerResponse<Catalog>> {
    return this.http.delete<ServerResponse<Catalog>>(enableCatalogEndpoint + id);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: catalogCache$
  })
  disableCatalog(id: string): Observable<ServerResponse<Catalog>> {
    return this.http.delete<ServerResponse<Catalog>>(disableCatalogEndpoint + id);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: catalogCache$
  })
  search(query: string): Observable<ServerResponse<Catalog[]>> {
    return this.http.get<ServerResponse<Catalog[]>>(searchEndpoint + query)
      .pipe(map(res => {
        res.data?.forEach(catalog => {
          catalog.products = catalog.products.filter(p => !p.product.disabled)
        });
        return res;
      }));
  }
}
