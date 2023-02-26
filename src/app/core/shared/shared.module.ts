// Decorators
import { NgModule } from '@angular/core';

// Modules
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

// Directives
import { MustMatchDirective } from '../directives/must-match.directive';
import { IsUrlDirective } from '../directives/is-url.directive';
import { IsIsbnDirective } from '../directives/is-isbn.directive';

// Pipes
import { CommentTimePipe } from '../pipes/comment-time.pipe';
import { ShortenStringPipe } from '../pipes/shorten-string.pipe';
import { NumberToTimePipe } from '../pipes/number-to-time.pipe';

// Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTabsModule } from '@angular/material/tabs';

// Components
import { CommentComponent } from './comment/comment.component';
import { CartComponent } from './cart/cart.component';
import { ContactComponent } from './contact/contact.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { SanitizerUrlPipe } from '../pipes/sanitizer-url.pipe';
import { PreviewComponent } from './preview/preview.component';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { ProductComponent } from './product/product.component';
import { ProductSpecificationComponent } from './product-specification/product-specification.component';
import { ImageViewComponent } from './image-view/image-view.component';
import { StarRatingComponent } from './star-rating/star-rating.component';
import { ProductCommentComponent } from './product-comment/product-comment.component';
import { AddEntityTriggerComponent } from './add-entity-trigger/add-entity-trigger.component';
import { OptionDialogComponent } from './option-dialog/option-dialog.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { LoaderComponent } from './loader/loader.component';
import { TimerCountDownComponent } from './timer-count-down/timer-count-down.component';
import { ChatMessageTimePipe } from '../pipes/chat-message-time.pipe';
import { UserSearchComponent } from './user-search/user-search.component';
import { ProductSearchComponent } from './product-search/product-search.component';
import { CatalogComponent } from './catalog/catalog.component';
import { ContactSearchComponent } from './client-search/contact-search.component';

@NgModule({
  declarations: [
    CommentComponent,
    CartComponent,
    MustMatchDirective,
    IsUrlDirective,
    IsIsbnDirective,
    CommentTimePipe,
    ShortenStringPipe,
    NumberToTimePipe,
    ChatMessageTimePipe,
    SanitizerUrlPipe,
    ContactComponent,
    ConfirmationDialogComponent,
    PreviewComponent,
    InputDialogComponent,
    ProductComponent,
    ProductSpecificationComponent,
    ImageViewComponent,
    StarRatingComponent,
    ProductCommentComponent,
    AddEntityTriggerComponent,
    OptionDialogComponent,
    ChatRoomComponent,
    ChatWindowComponent,
    LoaderComponent,
    TimerCountDownComponent,
    UserSearchComponent,
    ProductSearchComponent,
    CatalogComponent,
    ContactSearchComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatButtonModule,
    MatBadgeModule,
    MatExpansionModule,
    MatGridListModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonToggleModule,
    CarouselModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatAutocompleteModule,
    MatListModule,
    MatDividerModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    InfiniteScrollModule,
    DragDropModule,
    MatTabsModule
  ],
  exports: [
    CommentComponent,
    CartComponent,
    MustMatchDirective,
    IsUrlDirective,
    IsIsbnDirective,
    CommentTimePipe,
    ShortenStringPipe,
    NumberToTimePipe,
    ChatMessageTimePipe,
    SanitizerUrlPipe,
    ContactComponent,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatButtonModule,
    MatBadgeModule,
    MatExpansionModule,
    MatGridListModule,
    MatSelectModule,
    MatDialogModule,
    ConfirmationDialogComponent,
    MatButtonToggleModule,
    PreviewComponent,
    CarouselModule,
    InputDialogComponent,
    ProductComponent,
    ProductSpecificationComponent,
    ProductCommentComponent,
    MatChipsModule,
    StarRatingComponent,
    AddEntityTriggerComponent,
    MatSlideToggleModule,
    MatToolbarModule,
    MatAutocompleteModule,
    OptionDialogComponent,
    MatListModule,
    MatDividerModule,
    ChatRoomComponent,
    MatSidenavModule,
    ChatWindowComponent,
    MatProgressSpinnerModule,
    LoaderComponent,
    MatSnackBarModule,
    UserSearchComponent,
    InfiniteScrollModule,
    ProductSearchComponent,
    CatalogComponent,
    ContactSearchComponent,
    DragDropModule,
    MatTabsModule
  ]
})
export class SharedModule { }
