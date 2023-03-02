import { Injectable } from '@angular/core';
import { CashOnDelivery, Payment } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  lstIntents: string[] = ['sale', 'refund'];
  lstPaymentServices: Payment[] = [
    new CashOnDelivery('sale')
  ];

  constructor() { }
}
