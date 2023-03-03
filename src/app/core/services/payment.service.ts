import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from '../models/order.model';
import { CashOnDelivery, Payment } from '../models/payment.model';
import { ServerResponse } from '../models/server-response.model';


const domain = environment.api;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  lstIntents: string[] = ['sale', 'refund'];
  lstPaymentServices: Payment[] = [
    new CashOnDelivery('sale')
  ];

  constructor(private http: HttpClient) { }

  makePayment(url: string, payload: any): Observable<ServerResponse<Order>> {
    return this.http.post<ServerResponse<Order>>(url, payload);
  }
}
