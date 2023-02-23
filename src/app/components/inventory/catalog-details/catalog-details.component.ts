import { Component, DoCheck, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, takeUntil } from 'rxjs';
import { Catalog } from 'src/app/core/models/catalog.model';
import { Contact } from 'src/app/core/models/contact.model';
import { ProductClientCost } from 'src/app/core/models/product.model';
import { CatalogService } from 'src/app/core/services/catalog.service';

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
  isComponentIsActive = new Subject();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('catalogId');
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

  loadCatalog() {
    if (!this.id) return;
    this.catalogService.getSingleCatalog(this.id)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(catalogRes => {
        this.catalog = catalogRes.data;
        this.findSelectedClient();
      });
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

}
