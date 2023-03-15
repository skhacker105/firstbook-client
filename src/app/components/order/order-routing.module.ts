import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsAuthenticatedGuard } from 'src/app/core/guards/is-authenticated.guard';
import { MyOrdersComponent } from './my-orders/my-orders.component';

const routes: Routes = [
  
  {
    path: '',
    redirectTo: 'store/default',
    pathMatch: 'full'
  },
  {
    path: 'store/:query',
    canActivate: [IsAuthenticatedGuard],
    component: MyOrdersComponent
  },
  {
    path: '**',
    redirectTo: 'store/default',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }
