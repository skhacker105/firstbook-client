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
import { Cacheable, CacheBuster } from 'ts-cacheable';

const baseUrl = environment.api+ 'comment';
const addCommentEndpoint = '/add/';
const editCommentEndpoint = '/edit/';
const deleteCommentEndpoint = '/delete/';
const getLatestFiveEndpont = '/getLatestFiveByUser/';
const commentCache$ = new Subject<void>();

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) { }

  @Cacheable({
    cacheBusterObserver: commentCache$
  })
  getComments(id: string, page: string): Observable<ServerResponse<Comment[]>> {
    return this.http.get<ServerResponse<Comment[]>>(`${baseUrl}/${id}/${page}`);
  }

  @Cacheable({
    cacheBusterObserver: commentCache$
  })
  getLatestFiveComments(id: string): Observable<ServerResponse<Comment[]>> {
    return this.http.get<ServerResponse<Comment[]>>(baseUrl + getLatestFiveEndpont + id);
  }

  @CacheBuster({
    cacheBusterNotifier: commentCache$
  })
  addComment(id: string, payload: Comment): Observable<ServerResponse<Comment>> {
    return this.http.post<ServerResponse<Comment>>(baseUrl + addCommentEndpoint + id, payload);
  }

  @CacheBuster({
    cacheBusterNotifier: commentCache$
  })
  editComment(id: string, payload: Comment): Observable<ServerResponse<Comment>> {
    return this.http.put<ServerResponse<Comment>>(baseUrl + editCommentEndpoint + id, payload);
  }

  @CacheBuster({
    cacheBusterNotifier: commentCache$
  })
  deleteComment(id: string): Observable<ServerResponse<object>> {
    return this.http.delete<ServerResponse<object>>(baseUrl + deleteCommentEndpoint + id);
  }
}
