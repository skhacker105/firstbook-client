// Decorators
import { Injectable } from '@angular/core';

// RXJS
import { BehaviorSubject, map, mergeMap, Subject, switchMap, take, takeWhile, timer } from 'rxjs';

// JWT Decoding
import decode from 'jwt-decode';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  isUserLogged = new Subject<boolean>();
  searchQuery = new Subject<string>();
  cartStatus = new Subject<string>();
  showGlobalSearch = true;
  showFooter = true;
  pendingHttpCall = new BehaviorSubject<boolean>(false);
  sessionTimeRemaining = new BehaviorSubject<number>(0); // in seconds
  sessionEndingAlertLimit = 300; // seconds

  saveSession(token: any): void {
    localStorage.setItem('token', token);
  }

  clearSession(): void {
    localStorage.clear();
  }

  getProfile(): User | undefined {
    try {
      const decoded: any = decode(this.getToken());
      return decoded.sub;
    } catch (err) {
      return undefined;
    }
  }

  getExpiryTime(): Date | undefined {
    try {
      const decoded: any = decode(this.getToken());
      return decoded.exp;
    } catch (err) {
      return undefined;
    }
  }

  isLoggedIn(): boolean {
    try {
      const decoded: any = decode(this.getToken());

      if (decoded.exp > Date.now() / 1000) {
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }

  isAdmin(): boolean {
    try {
      const decoded: any = decode(this.getToken());

      if (decoded.exp < Date.now() / 1000 || !decoded.sub.isAdmin) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  getToken(): string {
    let val = localStorage.getItem('token');
    return val ? val : '';
  }

  hashFnv32a(str: string, asString = true, seed = undefined): string {
    /*jshint bitwise:false */
    var i, l,
      hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
      hval ^= str.charCodeAt(i);
      hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return ("0000000" + (hval >>> 0).toString(16));
  }

  statSessionWatch() {
    const expiryTime = this.getExpiryTime();
    if (expiryTime) {
      const diff = +expiryTime - Date.now() / 1000;
      this.waitTillAlertLimit(diff).pipe(
        mergeMap(x => this.countDownAfterLimit(diff))
      ).subscribe(tick => {
        this.sessionTimeRemaining.next(tick);
      });
    }
  }

  waitTillAlertLimit(diff: number) {
    const alertInTime = Math.ceil(diff < 0 ? 0 : diff < this.sessionEndingAlertLimit ? 0 : diff - this.sessionEndingAlertLimit) * 1000;
    return timer(alertInTime-1)
      .pipe(
        take(1),
        takeWhile(d => this.isLoggedIn())
      )
  }

  countDownAfterLimit(diff: number) {
    let countLimit = Math.floor(diff < 0 ? 0 : diff < this.sessionEndingAlertLimit ? diff : this.sessionEndingAlertLimit);
    return timer(0, 1000)
      .pipe(
        takeWhile(tick => countLimit - tick >= 0),
        map(tick => {
          return countLimit - tick;
        })
      );
  }
}
