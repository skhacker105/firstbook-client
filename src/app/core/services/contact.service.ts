import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HTTPCacheable, HTTPCacheBuster } from '../decorators/cacheable.decorator';
import { Contact } from '../models/contact.model';
import { ServerResponse } from '../models/server-response.model';
import { HelperService } from './helper.service';


const domain = environment.api;
const getSingleContactEndpoint = domain + 'contact/details/';
const createContactEndpoint = domain + 'contact/add';
const saveContactNotesEndpoint = domain + 'contact/saveNotes/';
const editContactEndpoint = domain + 'contact/edit/';
const deleteContactEndpoint = domain + 'contact/delete/';
const rateContactEndpoint = domain + 'contact/rate/';
const addToFavoritesEndpoint = domain + 'contact/addToFavorites/';
const searchContactEndpoint = domain + 'contact/search';
const contactCache$ = new Subject<boolean>();
const logout$ = new Subject<boolean>();

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient, private helperService: HelperService) {
    this.helperService.isUserLogged.subscribe(res => logout$.next(res));
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: contactCache$
  })
  getSingleContact(id: string): Observable<ServerResponse<Contact>> {
    return this.http.get<ServerResponse<Contact>>(getSingleContactEndpoint + id);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: contactCache$
  })
  createContact(payload: Contact): Observable<ServerResponse<Contact>> {
    return this.http.post<ServerResponse<Contact>>(createContactEndpoint, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: contactCache$
  })
  editContact(id: string, payload: Contact): Observable<ServerResponse<Contact>> {
    return this.http.put<ServerResponse<Contact>>(editContactEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: contactCache$
  })
  deleteContact(id: string): Observable<ServerResponse<Contact>> {
    return this.http.delete<ServerResponse<Contact>>(deleteContactEndpoint + id);
  }

  updateContactNotes(id: string, payload: any): Observable<ServerResponse<Contact>> {
    return this.http.post<ServerResponse<Contact>>(saveContactNotesEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: contactCache$
  })
  rateContact(id: string, payload: object): Observable<ServerResponse<Contact>> {
    return this.http.post<ServerResponse<Contact>>(rateContactEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: contactCache$
  })
  addToFavourites(id: string): Observable<ServerResponse<Contact>> {
    return this.http.post<ServerResponse<Contact>>(addToFavoritesEndpoint + id, {});
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: contactCache$
  })
  search(query: string): Observable<ServerResponse<Contact[]>> {
    return this.http.get<ServerResponse<Contact[]>>(searchContactEndpoint + query);
  }
}
