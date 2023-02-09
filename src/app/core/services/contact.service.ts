import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HTTPCacheable, HTTPCacheBuster } from '../decorators/cacheable.decorator';
import { Contact } from '../models/contact.model';
import { ServerResponse } from '../models/server-response.model';


const domain = environment.api;
const getSingleContactEndpoint = domain + 'contact/details/';
const createContactEndpoint = domain + 'contact/add';
const editContactEndpoint = domain + 'contact/edit/';
const deleteContactEndpoint = domain + 'contact/delete/';
const rateContactEndpoint = domain + 'contact/rate/';
const addToFavoritesEndpoint = domain + 'contact/addToFavorites/';
const searchContactEndpoint = domain + 'contact/search';
const contactCache$ = new Subject<boolean>();

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient) { }

  @HTTPCacheable({
    refresher: contactCache$
  })
  getSingleContact(id: string): Observable<ServerResponse<Contact>> {
    return this.http.get<ServerResponse<Contact>>(getSingleContactEndpoint + id);
  }

  @HTTPCacheBuster({
    refresher: contactCache$
  })
  createContact(payload: Contact): Observable<ServerResponse<Contact>> {
    return this.http.post<ServerResponse<Contact>>(createContactEndpoint, payload);
  }

  @HTTPCacheBuster({
    refresher: contactCache$
  })
  editContact(id: string, payload: Contact): Observable<ServerResponse<Contact>> {
    return this.http.put<ServerResponse<Contact>>(editContactEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    refresher: contactCache$
  })
  deleteContact(id: string): Observable<ServerResponse<Contact>> {
    return this.http.delete<ServerResponse<Contact>>(deleteContactEndpoint + id);
  }

  @HTTPCacheBuster({
    refresher: contactCache$
  })
  rateContact(id: string, payload: object): Observable<ServerResponse<Contact>> {
    return this.http.post<ServerResponse<Contact>>(rateContactEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    refresher: contactCache$
  })
  addToFavourites(id: string): Observable<ServerResponse<Contact>> {
    return this.http.post<ServerResponse<Contact>>(addToFavoritesEndpoint + id, {});
  }

  @HTTPCacheable({
    refresher: contactCache$
  })
  search(query: string): Observable<ServerResponse<Contact[]>> {
    return this.http.get<ServerResponse<Contact[]>>(searchContactEndpoint + query);
  }
}
