// Decorators
import { Injectable } from '@angular/core';

// RXJS
import { Observable, Subject } from 'rxjs';

// HTTP
import { HttpClient } from '@angular/common/http';

// Models
import { ServerResponse } from '../models/server-response.model';
import { Comment } from '../models/comment.model';
import { environment } from 'src/environments/environment';
import { HTTPCacheable, HTTPCacheBuster } from '../decorators/cacheable.decorator';
import { HelperService } from './helper.service';

const baseUrl = environment.api+ 'comment';
const addCommentEndpoint = '/add/';
const editCommentEndpoint = '/edit/';
const deleteCommentEndpoint = '/delete/';
const getLatestFiveEndpont = '/getLatestFiveByUser/';
const commentCache$ = new Subject<boolean>();
const logout$ = new Subject<boolean>();

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient, private helperService: HelperService) {
    this.helperService.isUserLogged.subscribe(res => logout$.next(res));
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: commentCache$
  })
  getComments(id: string, page: string): Observable<ServerResponse<Comment[]>> {
    return this.http.get<ServerResponse<Comment[]>>(`${baseUrl}/${id}/${page}`);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: commentCache$
  })
  getLatestFiveComments(id: string): Observable<ServerResponse<Comment[]>> {
    return this.http.get<ServerResponse<Comment[]>>(baseUrl + getLatestFiveEndpont + id);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: commentCache$
  })
  addComment(id: string, payload: Comment): Observable<ServerResponse<Comment>> {
    return this.http.post<ServerResponse<Comment>>(baseUrl + addCommentEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: commentCache$
  })
  editComment(id: string, payload: Comment): Observable<ServerResponse<Comment>> {
    return this.http.put<ServerResponse<Comment>>(baseUrl + editCommentEndpoint + id, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: commentCache$
  })
  deleteComment(id: string): Observable<ServerResponse<object>> {
    return this.http.delete<ServerResponse<object>>(baseUrl + deleteCommentEndpoint + id);
  }
}
