import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { finalize, Observable, tap } from 'rxjs';
import { HelperService } from '../services/helper.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  httpCount = 0;

  constructor(private helperService: HelperService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.httpCount++;
    this.helperService.pendingHttpCall.next(true);

    return next.handle(request)
      .pipe(finalize(() => {
        this.httpCount--;
        if (!this.httpCount)
          this.helperService.pendingHttpCall.next(false);
      }));
  }
}
