import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HTTPCacheable } from '../decorators/cacheable.decorator';
import { Order, OrderPaymentStatus } from '../models/order.model';
import { CashOnDelivery, Payment } from '../models/payment.model';
import { ServerResponse } from '../models/server-response.model';
import { HelperService } from './helper.service';

const domain = environment.api;
const placeOrderEndpoint = domain + 'order/placeOrder';
const getOrdersEndpoint = domain + 'order/getOrders';
const savePaymentInformationEndpoint = domain + 'order/savePaymentInformation/';
const orderCache$ = new Subject<boolean>();
const logout$ = new Subject<boolean>();

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  lstIntents: string[] = ['sale', 'refund'];
  lstPaymentServices: Payment[] = [
    new CashOnDelivery('sale')
  ];

  constructor(private http: HttpClient, private helperService: HelperService) {
    this.helperService.isUserLogged.subscribe(res => logout$.next(res));
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: orderCache$
  })
  placeOrder(order: any): Observable<ServerResponse<Order>> {
    return this.http.post<ServerResponse<Order>>(placeOrderEndpoint, order);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: orderCache$
  })
  savePaymentInformation(order: Order, paymentStatus: OrderPaymentStatus): Observable<ServerResponse<Order>> {
    return this.http.post<ServerResponse<Order>>(savePaymentInformationEndpoint+order._id, paymentStatus);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: orderCache$
  })
  getOrders(query: string): Observable<ServerResponse<Order[]>> {
    return this.http.get<ServerResponse<Order[]>>(getOrdersEndpoint + query);
  }
}
