// Decorators
import { NgModule } from '@angular/core';

// Modules
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { FooterComponent } from './footer/footer.component';

// Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { SharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  declarations: [
    HeaderComponent,
    NavigationComponent,
    FooterComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatButtonModule,
    MatBadgeModule,
    SharedModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    MatIconModule
  ]
})
export class MyCommonModule { }
