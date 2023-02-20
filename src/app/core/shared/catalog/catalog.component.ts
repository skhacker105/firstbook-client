import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Cart } from '../../models/cart.model';
import { Catalog, CatalogProduct } from '../../models/catalog.model';
import { ConfirmationDialogData } from '../../models/confirmation-dialog.model';
import { IInputDialogConfig } from '../../models/input-dialog-config';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';
import { CartService } from '../../services/cart.service';
import { CatalogService } from '../../services/catalog.service';
import { ChatRoomService } from '../../services/chat-room.service';
import { HelperService } from '../../services/helper.service';
import { ProductService } from '../../services/product.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { InputDialogComponent } from '../input-dialog/input-dialog.component';
import { UserSearchComponent } from '../user-search/user-search.component';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit, OnDestroy {

  @Input() catalog: Catalog | undefined;
  @Input() expanded = false;
  @Input() overideToShowImage = false;
  @Input() showActions = true;
  @Input() hideGotoDetailButton = false;
  isComponentIsActive = new Subject();
  isAdmin = false;
  isEditAllowed: boolean = false;
  loggedInUser: User | undefined;
  currentCart: Cart | undefined;
  customOptions: OwlOptions = {
    loop: true,
    margin: 10,
    autoplay: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    freeDrag: false,
    dotsEach: false,
    dotsData: false,
    items: 1,
    lazyLoad: true
  };

  constructor(
    private productService: ProductService,
    private helperService: HelperService,
    private router: Router,
    private catalogService: CatalogService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private chatRoomService: ChatRoomService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.currentCart = this.cartService.getCart();
    this.mapCartProducts();

    this.isAdmin = this.helperService.isAdmin();
    this.loggedInUser = this.helperService.getProfile();
    this.checkIfEditAllowed();
    this.loadImage();
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete();
  }

  mapCartProducts() {
    if (!this.catalog) return;
    if (!this.currentCart) {
      this.catalog.products.forEach(catalogProduct => catalogProduct.count = 0);
    } else {
      this.catalog.products.forEach(catalogProduct => {
        const matchingCartProducts = this.currentCart?.products
          .filter(cartProduct => cartProduct._id === catalogProduct.product._id);
        catalogProduct.count = matchingCartProducts ? matchingCartProducts.length : 0;
      });
    }
  }

  checkIfEditAllowed() {
    this.isEditAllowed = this.loggedInUser?._id === this.catalog?.createdBy || this.loggedInUser?.id === this.catalog?.createdBy;
  }

  loadImage() {
    if (!this.catalog) return;
    this.catalog.products.forEach(p => {
      if (p.product.defaultImage)
        this.productService.getImage(p.product.defaultImage)
          .pipe(takeUntil(this.isComponentIsActive))
          .subscribe(imageRes => {
            setTimeout(() => {
              p.product.loadedImage = imageRes.data;
            }, 10);
          })
    });
  }

  loadProductDetails(product: Product) {
    this.router.navigate(['/inventory/detail/', product._id]);
  }

  handleEnableCatalog() {
    let confirmData = new ConfirmationDialogData('Are you sure to enable this Catalog?');
    let confirmSetRef = this.dialog.open(ConfirmationDialogComponent, {
      data: confirmData
    });

    confirmSetRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((result: string) => {
        if (result) this.enableCatalog()
      });
  }

  enableCatalog() {
    if (!this.catalog) return;
    this.catalogService.enableCatalog(this.catalog._id)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(catalogRes => {
        if (!this.catalog) return;
        this.catalog.isDeleted = catalogRes.data?.isDeleted;
      })
  }

  handleDisableCatalog() {
    let confirmData = new ConfirmationDialogData('Are you sure to disable this Catalog?');
    let confirmSetRef = this.dialog.open(ConfirmationDialogComponent, {
      data: confirmData
    });

    confirmSetRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((result: string) => {
        if (result) this.disableCatalog()
      });
  }

  disableCatalog() {
    if (!this.catalog) return;
    this.catalogService.disableCatalog(this.catalog._id)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(catalogRes => {
        if (!this.catalog) return;
        this.catalog.isDeleted = catalogRes.data?.isDeleted;
      })
  }

  copyURL() {
    if (!this.catalog?._id) return;
    this.helperService.copyToClipboard(location.origin + '/inventory/catalog/detail/' + this.catalog._id);
    this.toastr.show('Catalog link saved to clipboard.')
  }

  handleShareCatalog() {
    let userRef = this.dialog.open(UserSearchComponent);
    userRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((user: User | undefined) => {
        if (user) {
          this.getMessageForCatalogShare(user)
            .pipe(takeUntil(this.isComponentIsActive))
            .subscribe((message: string) => {
              if (!this.catalog) return;
              let sharePayload = {
                catalogId: this.catalog._id,
                message: message
              }
              this.chatRoomService.shareCatalogWithUser(user._id, sharePayload)
                .pipe(takeUntil(this.isComponentIsActive))
                .subscribe(res => {
                  this.chatRoomService.resetChatroomCache();
                  this.toastr.success('Catalog shared with ' + (user.firstName ? user.firstName : user.username) + ' on chat.')
                })
            })
        }
      });
  }

  getMessageForCatalogShare(user: User): Observable<string> {
    const popupConfig: IInputDialogConfig = {
      title: 'Sharing with ' + (user.firstName ? user.firstName : user.username),
      inputLabel: 'Comment',
      placeHolder: 'Any comments for ' + this.catalog?.name
    }
    let commentRef = this.dialog.open(InputDialogComponent, {
      data: popupConfig
    });
    return commentRef.afterClosed().pipe(takeUntil(this.isComponentIsActive));
  }

  addToCart(catProduct: CatalogProduct) {
    this.currentCart = this.cartService.addToCart(catProduct.product);
    this.mapCartProducts();
  }

  removeFromCart(catProduct: CatalogProduct) {
    this.currentCart = this.cartService.removeFromCart(catProduct.product);
    this.mapCartProducts();
  }

  downalodExcel() {
    if (!this.catalog) return;
    this.catalogService.downloadCatalogAsExcel(this.catalog._id)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(data => {
        if (!this.catalog) return;
        const fileName = this.catalog.name + `.xlsx`;
        let file = new File([data], fileName);
        let fileUrl = URL.createObjectURL(file);
        var a = document.createElement("a");
        a.href = fileUrl;
        a.download = fileName;
        a.click();
      });
  }
}
