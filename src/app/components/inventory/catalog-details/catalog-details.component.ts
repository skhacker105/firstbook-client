import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { Catalog } from 'src/app/core/models/catalog.model';
import { Contact } from 'src/app/core/models/contact.model';
import { ItemImage } from 'src/app/core/models/image';
import { Product, ProductClientCost } from 'src/app/core/models/product.model';
import { User } from 'src/app/core/models/user.model';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { ProductService } from 'src/app/core/services/product.service';
import { ImageViewComponent } from 'src/app/core/shared/image-view/image-view.component';

@Component({
  selector: 'app-catalog-details',
  templateUrl: './catalog-details.component.html',
  styleUrls: ['./catalog-details.component.css']
})
export class CatalogDetailsComponent implements OnInit, OnDestroy {

  id: string | null | undefined;
  clientId: string | null | undefined;
  client: Contact | undefined;
  catalog: Catalog | undefined;
  isMobileView = false;
  tabularView = new FormControl<boolean>(false);
  isComponentIsActive = new Subject();
  triggerCatalogChange = new Subject<void>();
  isAdmin = false;
  isEditAllowed: boolean = false;
  loggedInUser: User | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private toastr: ToastrService,
    private productService: ProductService,
    private helperService: HelperService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('catalogId');
    this.isAdmin = this.helperService.isAdmin();
    this.loggedInUser = this.helperService.getProfile();

    this.setMobileView();
    this.route.paramMap
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((params: any) => {
        this.clientId = this.route.snapshot.paramMap.get('clientFilter');
        this.findSelectedClient();
      })
    this.loadCatalog();
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  setMobileView() {
    if (!this.isAdmin && !this.isEditAllowed) this.isMobileView = true;
    else this.isMobileView = window.innerWidth <= 500 ? true : false;
    this.tabularView.setValue(!this.isMobileView);
  }

  loadCatalog() {
    if (!this.id) return;
    this.catalogService.getSingleCatalog(this.id)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(catalogRes => {
        this.catalog = catalogRes.data;
        this.findSelectedClient();
        if (catalogRes.data) this.loadCatalogBanner(catalogRes.data);
        this.isEditAllowed = this.loggedInUser?._id === this.catalog?.createdBy || this.loggedInUser?.id === this.catalog?.createdBy;
      });
  }

  loadCatalogBanner(catalog: Catalog) {
    if (catalog.config?.banner && typeof catalog.config.banner === 'string') {
      this.catalogService.getBanner(catalog.config.banner)
        .pipe(takeUntil(this.isComponentIsActive))
        .subscribe(imageRes => {
          setTimeout(() => {
            if (imageRes.data && catalog.config) catalog.config.banner = imageRes.data;
          },10)
        });
    }
  }

  findSelectedClient() {
    if (!this.catalog) this.client = undefined;
    else if (!this.clientId) {
      this.client = undefined;
      this.catalog.products.forEach(catp => {
        catp.product.clientCostSelected = undefined;
      });
    }
    else
      this.catalog.products.forEach(catp => {
        let found: ProductClientCost | undefined = undefined;
        catp.product.clientCosts?.forEach(cc => {
          if (cc.client._id === this.clientId) {
            found = cc;
            this.client = cc.client;
          }
        });
        catp.product.clientCostSelected = found;
      });
  }

  handleClientChanged(client: Contact | undefined) {
    if (!this.catalog) return;
    if (client)
      this.router.navigate(['/inventory/catalog/detail/', this.catalog._id, client._id]);
    else
      this.router.navigate(['/inventory/catalog/detail/', this.catalog._id]);
  }

  handleEditCost(payload: any) {
    if (!payload) return;
    this.catalogService.updateProductCost(payload)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(updatedCatalogRes => {
        if ((!updatedCatalogRes.data)) this.toastr.error('Cost updation failed.');
        else this.editCost(payload);
      })
  }

  editCost(payload: any) {
    if (payload.clientCostId) {
      const obj = this.catalog?.products.find(cp => cp._id === payload.catProductId)
        ?.product.clientCosts?.find(cc => cc._id === payload.clientCostId);
      if (obj) obj.cost = payload.cost;
    } else {
      const obj = this.catalog?.products.find(cp => cp._id === payload.catProductId);
      if (obj) obj.cost = payload.cost;
    }
  }

  addClient(data: { client: Contact, product: Product, cost: number }) {
    this.productService.addClientCost(data.product._id, {
      client: data.client._id,
      cost: data.cost
    })
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(updatedClientCostRes => {
        if (updatedClientCostRes.data) {
          data.product.clientCosts?.push(updatedClientCostRes.data);
          this.triggerCatalogChange.next();
        }
      });
  }

  handleImageClick(image: ItemImage | string) {
    if (typeof image === 'string') return;
    const imageViewRef = this.dialog.open(ImageViewComponent, {
      data: image
    });
  }

}
