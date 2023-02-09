import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { HelperService } from '../services/helper.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {


  constructor(private helperService: HelperService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.helperService.increaseHttpCallCounter();

    return next.handle(request)
      .pipe(tap(res => this.helperService.decreaseHttpCallCounter()));
  }
}
