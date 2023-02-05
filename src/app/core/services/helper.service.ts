// Decorators
import { Injectable } from '@angular/core';

// RXJS
import { Subject } from 'rxjs';

// JWT Decoding
import decode from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';
import { AddEntity } from '../models/add-entity.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  isUserLogged = new Subject<boolean>();
  searchQuery = new Subject<string>();
  cartStatus = new Subject<string>();

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
}
