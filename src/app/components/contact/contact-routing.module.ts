import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactAddEditComponent } from './contact-add-edit/contact-add-edit.component';
import { ContactStoreComponent } from './contact-store/contact-store.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'store/default',
    pathMatch: 'full'
  },
  {
    path: 'store/:query',
    component: ContactStoreComponent
  },
  {
    path: 'create',
    component: ContactAddEditComponent
  },
  {
    path: 'edit/:contactId',
    component: ContactAddEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactRoutingModule { }
