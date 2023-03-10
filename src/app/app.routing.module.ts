// Decorators
import { NgModule } from '@angular/core';

// Modules
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

// Components
import { HomeComponent } from './components/landing/home/home.component';
import { IsAuthenticatedGuard } from './core/guards/is-authenticated.guard';
import { LoadUserCatalogResolver } from './core/resolvers/load-user-catalog.resolver';
import { LoadUserProductResolver } from './core/resolvers/load-user-product.resolver';

const routes: Routes = [
  {
    path: 'user',
    loadChildren: () => import('./components/user/user.module').then(m => m.UserModule)
  },
  {
    path: 'contact',
    canActivate: [IsAuthenticatedGuard],
    loadChildren: () => import('./components/contact/contact.module').then(m => m.ContactModule)
  },
  {
    path: 'inventory',
    resolve: [LoadUserProductResolver, LoadUserCatalogResolver],
    loadChildren: () => import('./components/inventory/inventory.module').then(m => m.InventoryModule)
  },
  {
    path: 'chatroom',
    loadChildren: () => import('./components/chat-room/chat-room.module').then(m => m.ChatRoomModule)
  },
  {
    path: 'chatroomwindow',
    loadChildren: () => import('./components/chat-room-window/chat-room-window.module').then(m => m.ChatRoomWindowModule)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./components/checkout/checkout.module').then(m => m.CheckoutModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./components/order/order.module').then(m => m.OrderModule)
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      { preloadingStrategy: PreloadAllModules }
    )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
