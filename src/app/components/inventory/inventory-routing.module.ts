import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsAuthenticatedGuard } from 'src/app/core/guards/is-authenticated.guard';
import { IsCatalogOwnerGuard } from 'src/app/core/guards/is-catalog-owner.guard';
import { IsProductOwnerGuard } from 'src/app/core/guards/is-product-owner.guard';
import { CatalogStoreComponent } from './catalog-store/catalog-store.component';
import { CreateCatalogComponent } from './create-catalog/create-catalog.component';
import { InventoryStoreComponent } from './inventory-store/inventory-store.component';
import { ProductCreateComponent } from './product-create/product-create.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

const routes: Routes = [
  // PRODUCT
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
  },
  {
    path: 'catalog',
    children: [
      {
        path: '',
        redirectTo: 'store/default',
        pathMatch: 'full'
      },
      {
        path: 'store/:query',
        canActivate: [IsAuthenticatedGuard],
        component: CatalogStoreComponent
      },
      {
        path: 'create',
        canActivate: [IsAuthenticatedGuard],
        component: CreateCatalogComponent
      },
      {
        path: 'edit/:catalogId',
        canActivate: [IsAuthenticatedGuard, IsCatalogOwnerGuard],
        component: CreateCatalogComponent
      },
      // {
      //   path: 'catalog/detail/:catalogId',
      //   component: ProductDetailComponent
      // }
      {
        path: '**',
        redirectTo: 'store/default',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'store/default',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
