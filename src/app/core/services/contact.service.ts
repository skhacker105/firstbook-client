import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
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

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient) { }

  getSingleContact(id: string): Observable<ServerResponse<Contact>> {
    return this.http.get<ServerResponse<Contact>>(getSingleContactEndpoint + id);
  }

  createContact(payload: Contact): Observable<ServerResponse<Contact>> {
    return this.http.post<ServerResponse<Contact>>(createContactEndpoint, payload);
  }

  editContact(id: string, payload: Contact): Observable<ServerResponse<Contact>> {
    return this.http.put<ServerResponse<Contact>>(editContactEndpoint + id, payload);
  }

  deleteContact(id: string): Observable<ServerResponse<Contact>> {
    return this.http.delete<ServerResponse<Contact>>(deleteContactEndpoint + id);
  }

  rateContact(id: string, payload: object): Observable<ServerResponse<Contact>> {
    return this.http.post<ServerResponse<Contact>>(rateContactEndpoint + id, payload);
  }

  addToFavourites(id: string): Observable<ServerResponse<Contact>> {
    return this.http.post<ServerResponse<Contact>>(addToFavoritesEndpoint + id, {});
  }

  search(query: string): Observable<ServerResponse<Contact[]>> {
    return this.http.get<ServerResponse<Contact[]>>(searchContactEndpoint + query);
  }
}
