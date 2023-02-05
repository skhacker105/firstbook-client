// Decorators
import { NgModule } from '@angular/core';

// Modules
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

// Components
import { HomeComponent } from './components/landing/home/home.component';
import { IsAuthenticatedGuard } from './core/guards/is-authenticated.guard';

const routes: Routes = [
  {
    path: 'user',
    loadChildren: () => import('./components/user/user.module').then(m => m.UserModule)
  },
  {
    path: 'book',
    loadChildren: () => import('./components/book/book.module').then(m => m.BookModule)
  },
  {
    path: 'contact',
    canActivate: [IsAuthenticatedGuard],
    loadChildren: () => import('./components/contact/contact.module').then(m => m.ContactModule)
  },
  {
    path: 'inventory',
    loadChildren: () => import('./components/inventory/inventory.module').then(m => m.InventoryModule)
  },
  {
    path: 'chatroom',
    loadChildren: () => import('./components/chat-room/chat-room.module').then(m => m.ChatRoomModule)
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
