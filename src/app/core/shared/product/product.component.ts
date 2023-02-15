import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, mergeMap, Observable, of, Subject, takeUntil } from 'rxjs';
import { ConfirmationDialogData } from '../../models/confirmation-dialog.model';
import { ItemImage } from '../../models/image';
import { IInputDialogConfig } from '../../models/input-dialog-config';
import { Product, ProductSpecification } from '../../models/product.model';
import { ServerResponse } from '../../models/server-response.model';
import { ISpecs } from '../../models/specs';
import { User } from '../../models/user.model';
import { ChatRoomService } from '../../services/chat-room.service';
import { HelperService } from '../../services/helper.service';
import { ProductSpecsService } from '../../services/product-specs.service';
import { ProductService } from '../../services/product.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ImageViewComponent } from '../image-view/image-view.component';
import { InputDialogComponent } from '../input-dialog/input-dialog.component';
import { UserSearchComponent } from '../user-search/user-search.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {

  @Input('productId') id: string | undefined;
  @Input('loadOnlyMainImage') mainImageOnly: boolean = false;
  @Input() showChatVersion = false;
  product: Product | undefined;
  specs: ProductSpecification[] = [];
  unique_specs: ISpecs[] = [];
  mainImage: ItemImage | undefined;
  images: ItemImage[] = [];
  customOptions: OwlOptions | undefined;
  loggedInUser: User | undefined;
  isEditAllowed: boolean = false;
  isComponentIsActive = new Subject();

  constructor(
    private productService: ProductService,
    private productSpecsService: ProductSpecsService,
    private router: Router,
    private helperService: HelperService,
    public dialog: MatDialog,
    private chatRoomService: ChatRoomService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUser();
    this.checkIfEditAllowed();
    this.carouselOptions();
    this.loadProductDetails();
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  loadLoggedInUser() {
    this.loggedInUser = this.helperService.getProfile();
  }

  carouselOptions() {
    this.customOptions = {
      loop: true,
      margin: 10,
      autoplay: false,
      mouseDrag: this.mainImageOnly ? false : true,
      touchDrag: this.mainImageOnly ? false : true,
      pullDrag: this.mainImageOnly ? false : true,
      freeDrag: this.mainImageOnly ? false : true,
      dotsEach: this.mainImageOnly ? false : true,
      dotsData: this.mainImageOnly ? false : true,
      items: 1,
      lazyLoad: true
    };
  }

  loadProductDetails() {
    if (!this.id) return;

    this.productService
      .getSingleProduct(this.id)
      .pipe(
        mergeMap(productRes => {
          if (!productRes.data) return of(undefined)
          this.product = productRes.data;

          return forkJoin([
            this.loadProductSpecification(productRes.data),
            this.loadProductMainImage(productRes.data),
            !this.mainImageOnly ? this.loadProductImages(productRes.data) : of([])
          ])
        })
      ).pipe(takeUntil(this.isComponentIsActive))
      .subscribe((res: any) => {
        setTimeout(() => {
          this.specs = res[0] ? res[0].data : [];
          this.mainImage = res[1] ? res[1].data : undefined;
          this.images = res[2] ? res[2].map((r: any) => r.data) : [];
          this.divideSpecsByCategory();
        }, 10);
      })
  }

  loadProductSpecification(product: Product): Observable<ServerResponse<ProductSpecification[]>> {
    return this.productSpecsService.getProductSpecs(product._id)
  }

  loadProductMainImage(product: Product): Observable<ServerResponse<ItemImage> | undefined> {
    if (!product.defaultImage) return of(undefined);
    return this.productService.getImage(product.defaultImage);
  }

  loadProductImages(product: Product): Observable<ServerResponse<ItemImage>[] | undefined> {
    if (!product.images || product.images.length === 0) return of(undefined);
    let r: Observable<ServerResponse<ItemImage>>[] = [];
    product.images.forEach(imgId => r.push(this.productService.getImage(imgId)))
    return forkJoin(r);
  }

  divideSpecsByCategory() {
    let unique_specs: ISpecs[] = [];
    this.specs.forEach(spec => {
      const us = unique_specs.find(s => s.name === spec.category);
      if (us && us.categorySpecs) {
        us.categorySpecs.push(spec);
        us.count = us.count + 1;
      } else {
        unique_specs.push({
          name: spec.category,
          count: 0,
          isOpen: true,
          categorySpecs: [spec]
        })
      }
    });
    this.unique_specs = unique_specs;
  }

  goToDetail() {
    if (this.product?.disabled) return;
    this.router.navigateByUrl(`/inventory/detail/${this.id}`);
  }

  goToEditDetail() {
    this.router.navigate([`/inventory/edit/${this.id}`]);
  }

  checkIfEditAllowed() {
    this.isEditAllowed = this.loggedInUser?._id === this.product?.createdBy;
  }

  handleEnableDisable(state: boolean) {
    let confirmData = new ConfirmationDialogData('Are you sure to ' + (state ? 'enable' : 'disable') + ' this Item?');
    let confirmSetRef = this.dialog.open(ConfirmationDialogComponent, {
      data: confirmData
    });

    confirmSetRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((result: string) => {
        if (result && state) this.enableProduct()
        else if (result && !state) this.disableProduct()
      });
  }

  enableProduct() {
    if (!this.product) return;
    this.productService
      .enableProduct(this.product._id)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(res => {
        if (!this.product) return;
        this.product['disabled'] = false;
      });
  }

  disableProduct() {
    if (!this.product) return;
    this.productService
      .disableProduct(this.product._id)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(res => {
        if (!this.product) return;
        this.product['disabled'] = true;
      })
  }

  handleImageClick(image: any) {
    const imageViewRef = this.dialog.open(ImageViewComponent, {
      data: image.image
    });
  }

  handleShareProduct() {
    let userRef = this.dialog.open(UserSearchComponent);
    userRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((user: User | undefined) => {
        if (user) {
          this.getMessageForProductShare(user)
            .pipe(takeUntil(this.isComponentIsActive))
            .subscribe((message: string) => {
              if (!this.product) return;
              let sharePayload = {
                productId: this.product._id,
                message: message
              }
              this.chatRoomService.shareProductWithUser(user._id, sharePayload)
                .pipe(takeUntil(this.isComponentIsActive))
                .subscribe(res => {
                  this.chatRoomService.resetChatroomCache();
                  this.toastr.success('Product shared with ' + (user.firstName ? user.firstName : user.username) + ' on chat.')
                })
            })
        }
      });
  }

  getMessageForProductShare(user: User): Observable<string> {
    const popupConfig: IInputDialogConfig = {
      title: 'Sharing with ' + (user.firstName ? user.firstName : user.username),
      inputLabel: 'Comment',
      placeHolder: 'Any comments for ' + this.product?.name
    }
    let commentRef = this.dialog.open(InputDialogComponent, {
      data: popupConfig
    });
    return commentRef.afterClosed().pipe(takeUntil(this.isComponentIsActive));
  }

}
