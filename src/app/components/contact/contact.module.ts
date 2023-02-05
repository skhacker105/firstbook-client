import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ContactRoutingModule } from './contact-routing.module';
import { ContactStoreComponent } from './contact-store/contact-store.component';
import { SharedModule } from 'src/app/core/shared/shared.module';
import { ContactAddEditComponent } from './contact-add-edit/contact-add-edit.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ContactStoreComponent,
    ContactAddEditComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule,
    ContactRoutingModule
  ]
})
export class ContactModule { }
