import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Cart } from '../../models/cart.model';
import { Catalog, CatalogProduct } from '../../models/catalog.model';
import { ConfirmationDialogData } from '../../models/confirmation-dialog.model';
import { Contact } from '../../models/contact.model';
import { IInputDialogConfig } from '../../models/input-dialog-config';
import { Product, ProductClientCost } from '../../models/product.model';
import { User } from '../../models/user.model';
import { CartService } from '../../services/cart.service';
import { CatalogService } from '../../services/catalog.service';
import { ChatRoomService } from '../../services/chat-room.service';
import { HelperService } from '../../services/helper.service';
import { ProductService } from '../../services/product.service';
import { ContactSearchComponent } from '../client-search/contact-search.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { InputDialogComponent } from '../input-dialog/input-dialog.component';
import { UserSearchComponent } from '../user-search/user-search.component';


@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit, OnDestroy, OnChanges {

  @Input() catalog: Catalog | undefined;
  @Input() expanded = false;
  @Input() overideToShowImage = false;
  @Input() showActions = true;
  @Input() hideGotoDetailButton = false;
  @Input() hideDescription = false;
  @Input() hideClientCostFilter = false;
  @Input() hideDownload = false;
  @Input() selectedClient: Contact | undefined;
  @Input() tabularView: boolean | null = false;
  @Input() triggerCatalogChange: Subject<void> | undefined;
  @Output() clientChanged = new EventEmitter<Contact | undefined>();
  @Output() clientCostChanged = new EventEmitter<any>();
  @Output() addClient = new EventEmitter<{ client: Contact, product: Product, cost: number }>();
  isComponentIsActive = new Subject();
  isAdmin = false;
  zoomed = false;
  isPrintTriggered = false;
  isEditAllowed: boolean = false;
  loggedInUser: User | undefined;
  currentCart: Cart | undefined;
  cumulativeClients: Contact[] = [];
  lstProductClientCosts: ProductClientCost[] = [];
  catalogProductColumns: string[] = [];
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
    this.onCatalogReload();

    this.helperService.printTriggered.pipe(takeUntil(this.isComponentIsActive)).subscribe(state => { this.isPrintTriggered = state });
    this.triggerCatalogChange?.pipe(takeUntil(this.isComponentIsActive)).subscribe(res => this.onCatalogReload());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['catalog']) {
      this.onCatalogReload();
    }
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete();
  }

  onCatalogReload() {
    this.catalogProductColumns = [];
    this.mapCartProducts();
    this.accumulateClients();

    this.isAdmin = this.helperService.isAdmin();
    this.loggedInUser = this.helperService.getProfile();
    this.checkIfEditAllowed();
    if ((!this.isEditAllowed || this.overideToShowImage) && !this.catalog?.isDeleted)
      this.loadImage();
    this.recreateCatalogColumns();

  }

  recreateCatalogColumns() {
    if (!this.catalog) return;
    let catalogProductColumns = ['name', 'cost'];
    this.cumulativeClients.forEach(cc => {
      catalogProductColumns.push(cc.firstName);
    });
    catalogProductColumns.push('action');
    this.catalogProductColumns = catalogProductColumns
  }

  productClient(product: Product, clientName: string): ProductClientCost | undefined {
    return product.clientCosts?.find(cc => cc.client.firstName === clientName)
  }

  accumulateClients() {
    const cumulativeClients: Contact[] = [];
    this.catalog?.products.forEach(p => {
      p.product.clientCosts?.forEach(cc => {
        if (!cumulativeClients.some(c => c._id === cc.client._id))
          cumulativeClients.push(cc.client)
      });
    });
    this.cumulativeClients = cumulativeClients;
  }

  mapCartProducts() {
    if (!this.catalog) return;
    if (!this.currentCart) {
      this.catalog.products.forEach(catalogProduct => catalogProduct.count = 0);
    } else {
      this.catalog.products.forEach(catalogProduct => {
        const matchingCartProducts = this.currentCart?.products
          .find(cartProduct => cartProduct.product._id === catalogProduct.product._id);
        catalogProduct.count = matchingCartProducts ? matchingCartProducts.count : 0;
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
    this.helperService.copyToClipboard(location.origin + '/inventory/catalog/detail/' + this.catalog._id + (this.selectedClient ? '/' + this.selectedClient._id : ''));
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
    const cost = catProduct.product.clientCostSelected ? catProduct.product.clientCostSelected.cost : catProduct.cost;
    this.currentCart = this.cartService.addToCart(catProduct.product, cost, this.loggedInUser);
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

  selectProductContactCost(catProduct: CatalogProduct, userCostSelected: ProductClientCost | undefined) {
    catProduct.product.clientCostSelected = userCostSelected;
  }

  changeClient(client: Contact | undefined) {
    this.clientChanged.emit(client);
  }

  exportToPDF() {
    if (!this.catalog) return
    this.catalogService.downloadCatalogAsPDF(this.catalog._id, this.selectedClient?._id)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(pdfResponse => {
        if (!this.catalog) return;
        const fileName = this.catalog.name + `.pdf`;
        let file = new File([pdfResponse], fileName);
        let fileUrl = URL.createObjectURL(file);
        var a = document.createElement("a");
        a.href = fileUrl;
        a.download = fileName;
        a.click();
      });
  }

  selectAndHandleEditCostClick(catProduct: CatalogProduct, client?: ProductClientCost) {
    catProduct.product.clientCostSelected = client;
    this.handleEditCostClick(catProduct);
  }

  handleEditCostClick(catProduct: CatalogProduct) {
    const selectedClient = catProduct.product.clientCostSelected;
    const config: IInputDialogConfig = {
      initialValue: selectedClient ? selectedClient.cost.toString() : catProduct.cost.toString(),
      inputLabel: selectedClient ? selectedClient.client.firstName : 'Generic',
      multiLine: false,
      placeHolder: 'Input numbers only',
      hint: 'Changing for product ' + catProduct.name,
      title: 'Update Cost of a Client'
    };
    const newCostRef = this.dialog.open(InputDialogComponent, {
      data: config
    });

    newCostRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(result => {
        if (result && isNaN(+result)) return this.toastr.error('Only numbers are allowed');
        if (result && +result != (selectedClient ? selectedClient.cost : catProduct.cost)) {
          this.triggerEditCost(catProduct, +result);
        }
        return;
      })
  }

  triggerEditCost(catProduct: CatalogProduct, cost: number) {
    if (!this.catalog) return;
    const payload = {
      catalogId: this.catalog._id,
      catProductId: catProduct._id,
      clientCostId: catProduct.product.clientCostSelected?._id,
      cost: cost
    }
    this.clientCostChanged.emit(payload);
  }

  handleAddNewClientCost(catproduct: CatalogProduct) {
    const contactSearchRef = this.dialog.open(ContactSearchComponent);
    contactSearchRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((result: Contact | undefined) => {
        if (result) {
          if (result.type != this.helperService.contactTypes.client) {
            this.toastr.error('Please select only client type contact.');
            this.handleAddNewClientCost(catproduct);
          } else if (catproduct.product.clientCosts?.some(cc => cc.client._id === result._id)) {
            this.toastr.error('Client already exists in product\'s list')
          } else this.getCostForNewClient(catproduct, result);
        }
      });
  }

  getCostForNewClient(catproduct: CatalogProduct, client: Contact) {
    const config: IInputDialogConfig = {
      initialValue: catproduct.cost.toString(),
      inputLabel: 'Cost',
      title: "Product Cost"
    };
    const inputref = this.dialog.open(InputDialogComponent, {
      data: config
    });

    inputref.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((result: string) => {
        // if (!result) return this.toastr.error('Client was not added as no cost was provided.')
        if (result && !isNaN(+result) && +result > 0) this.updateClientInProduct(catproduct, client, +result)
        return;
      });
  }

  updateClientInProduct(catproduct: CatalogProduct, client: Contact, cost: number) {
    if (catproduct.product.clientCosts?.some(cc => cc._id === client._id))
      return this.toastr.error('Client already exists in your product\'s listenerCount.')

    this.addClient.emit({ client, product: catproduct.product, cost });
    return;
  }

  toggleZoom() {
    this.zoomed = !this.zoomed;
  }
}
