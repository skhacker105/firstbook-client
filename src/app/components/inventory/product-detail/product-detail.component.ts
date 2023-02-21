import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject, takeUntil } from 'rxjs';
import { ConfirmationDialogData } from 'src/app/core/models/confirmation-dialog.model';
import { ItemImage } from 'src/app/core/models/image';
import { IInputDialogConfig } from 'src/app/core/models/input-dialog-config';
import { Product, ProductSpecification } from 'src/app/core/models/product.model';
import { ServerResponse } from 'src/app/core/models/server-response.model';
import { ISpecs } from 'src/app/core/models/specs';
import { User } from 'src/app/core/models/user.model';
import { ChatRoomService } from 'src/app/core/services/chat-room.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { ProductSpecsService } from 'src/app/core/services/product-specs.service';
import { ProductService } from 'src/app/core/services/product.service';
import { ConfirmationDialogComponent } from 'src/app/core/shared/confirmation-dialog/confirmation-dialog.component';
import { InputDialogComponent } from 'src/app/core/shared/input-dialog/input-dialog.component';
import { UserSearchComponent } from 'src/app/core/shared/user-search/user-search.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {

  id: string | null | undefined;
  product: Product | undefined;
  unique_specs: ISpecs[] = [];
  mainImage: ItemImage | undefined;
  images: ItemImage[] = [];
  customOptions: OwlOptions | undefined;
  isEditAllowed: boolean = false;
  loggedInUser: User | undefined;
  isAdmin = false;
  userId: string | undefined;
  isLogged: boolean | undefined;
  isComponentIsActive = new Subject();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private productSpecsService: ProductSpecsService,
    private router: Router,
    private helperService: HelperService,
    private meta: Meta,
    private dialog: MatDialog,
    private chatRoomService: ChatRoomService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.updateMetaInfo();
    this.id = this.route.snapshot.paramMap.get('productId');
    this.isLogged = this.helperService.isLoggedIn();
    this.isAdmin = this.helperService.isAdmin();
    this.userId = this.helperService.getProfile()?.id;

    this.loadLoggedInUser();
    this.carouselOptions();
    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  carouselOptions() {
    this.customOptions = {
      loop: true,
      margin: 10,
      autoplay: false,
      mouseDrag: true,
      touchDrag: true,
      pullDrag: true,
      freeDrag: true,
      dotsEach: true,
      dotsData: true,
      responsive: {
        0: {
          items: 1
        },
        480: {
          items: 2
        },
        940: {
          items: 3
        }
      }
    };
  }

  loadProduct(): void {
    if (!this.id) return;

    this.productService
      .getSingleProduct(this.id)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((productRes) => {
        if (!this.id) return;

        this.product = productRes.data;
        this.checkIfEditAllowed();
        this.loadProductSpecs(productRes.data);
        this.loadProductMainImage(productRes.data);
        this.loadProductImages(productRes.data);
      });
  }

  loadProductSpecs(loadedProduct?: Product) {
    if (!loadedProduct) return;
    this.productSpecsService
      .getProductSpecs(loadedProduct._id)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(specsRes => {

        loadedProduct.specifications = specsRes.data ? specsRes.data : [];
        const new_unique_specs: ISpecs[] = [];
        specsRes.data?.forEach(d => {
          this.updateSpecData(new_unique_specs, d);
        });
        this.unique_specs = new_unique_specs;
      });
  }

  updateSpecData(unique_specs: ISpecs[], s: ProductSpecification) {
    let spec_data = unique_specs.find(spec => spec.name === s.name);
    if (!spec_data) {
      spec_data = {
        name: s.category,
        count: 0,
        isOpen: true,
        categorySpecs: []
      }
      unique_specs.push(spec_data);
    }
    spec_data.categorySpecs?.push(s)
    spec_data.count = spec_data.count + 1;
  }

  loadProductMainImage(loadedProduct?: Product) {
    if (!loadedProduct || !loadedProduct.defaultImage) return;
    this.productService
      .getImage(loadedProduct.defaultImage)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(fileRes => {
        this.mainImage = fileRes.data;
      });
  }

  loadProductImages(loadedProduct?: Product) {
    if (!loadedProduct || !loadedProduct.images) return;
    const subscription: Observable<ServerResponse<ItemImage>>[] = [];

    loadedProduct.images.forEach(imgids => {
      subscription.push(this.productService.getImage(imgids))
    });
    this.images = [];
    if (subscription.length > 0) {
      forkJoin(subscription)
        .pipe(takeUntil(this.isComponentIsActive)).subscribe(imgsRes => {
          imgsRes.forEach(imgRes => {
            if (imgRes.data)
              this.images.push(imgRes.data);
            this.images = JSON.parse(JSON.stringify(this.images));
          });
        });
    }
  }

  updateMetaInfo(loadedProduct?: Product) {
      this.meta.updateTag({ property: 'og:title', content: 'PRODUCT' });
      this.meta.updateTag({ property: 'og:url', content: window.location.href });
  }

  goToEditDetail() {
    this.router.navigate([`/inventory/edit/${this.id}`]);
  }

  checkIfEditAllowed() {
    this.isEditAllowed = this.loggedInUser?.id === this.product?.createdBy || this.loggedInUser?._id === this.product?.createdBy;
  }

  loadLoggedInUser() {
    this.loggedInUser = this.helperService.getProfile();
  }

  rateProduct(rating: number) {
    if (!this.id) return;
    this.productService
      .rateProduct(this.id, { rating: rating })
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
        if (!this.product || !res.data) return;
        this.product = res.data;
      });
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
