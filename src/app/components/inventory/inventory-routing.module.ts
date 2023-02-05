import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsAuthenticatedGuard } from 'src/app/core/guards/is-authenticated.guard';
import { IsProductOwnerGuard } from 'src/app/core/guards/is-product-owner.guard';
import { InventoryStoreComponent } from './inventory-store/inventory-store.component';
import { ProductCreateComponent } from './product-create/product-create.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'store/default',
    pathMatch: 'full'
  },
  {
    path: 'store/:query',
    canActivate: [IsAuthenticatedGuard],
    component: InventoryStoreComponent
  },
  {
    path: 'create',
    canActivate: [IsAuthenticatedGuard],
    component: ProductCreateComponent
  },
  {
    path: 'edit/:productId',
    canActivate: [IsAuthenticatedGuard, IsProductOwnerGuard],
    component: ProductCreateComponent
  },
  {
    path: 'detail/:productId',
    component: ProductDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
