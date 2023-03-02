import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './checkout/checkout.component';
import { SharedModule } from 'src/app/core/shared/shared.module';


@NgModule({
  declarations: [
    CheckoutComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CheckoutRoutingModule
  ]
})
export class CheckoutModule { }
