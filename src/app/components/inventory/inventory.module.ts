import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryStoreComponent } from './inventory-store/inventory-store.component';
import { ProductCreateComponent } from './product-create/product-create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/core/shared/shared.module';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { QuillModule } from 'ngx-quill';
import { CatalogComponent } from './catalog/catalog.component';
import { CreateCatalogComponent } from './create-catalog/create-catalog.component';


@NgModule({
  declarations: [
    InventoryStoreComponent,
    ProductCreateComponent,
    ProductDetailComponent,
    CatalogComponent,
    CreateCatalogComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    QuillModule.forRoot()
  ]
})
export class InventoryModule { }
