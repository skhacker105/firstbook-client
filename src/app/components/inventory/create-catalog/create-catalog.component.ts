import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { Catalog, CatalogProduct } from 'src/app/core/models/catalog.model';
import { Product } from 'src/app/core/models/product.model';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { ProductSearchComponent } from 'src/app/core/shared/product-search/product-search.component';

@Component({
  selector: 'app-create-catalog',
  templateUrl: './create-catalog.component.html',
  styleUrls: ['./create-catalog.component.css']
})
export class CreateCatalogComponent implements OnInit, OnDestroy {

  id: string | null | undefined;
  isComponentIsActive = new Subject();
  createCatalogGroup: FormGroup | undefined;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private helperService: HelperService,
    private catalogService: CatalogService,
    private toastr: ToastrService,
    private router: Router,
    public route: ActivatedRoute
  ) { }

  get products(): FormArray | undefined {
    return this.createCatalogGroup?.controls['products'] as FormArray
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('catalogId');
    this.helperService.showGlobalSearch = false;
    if (!this.id) this.initCatalogForm();
    else this.loadCatalog();
  }

  ngOnDestroy(): void {
    this.helperService.showGlobalSearch = true;
    this.isComponentIsActive.complete();
  }

  loadCatalog() {
    if (!this.id) return;
    this.catalogService.getSingleCatalog(this.id)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(catalogRes => {
        if (catalogRes.data) this.initCatalogForm(catalogRes.data);
      });
  }

  initCatalogForm(catalog?: Catalog): void {
    this.createCatalogGroup = this.fb.group({
      name: new FormControl(catalog?.name, Validators.required),
      products: this.fb.array(this.getProductFormArray(catalog?.products))
    });
  }

  getProductFormArray(CatalogProduct?: CatalogProduct[]): FormGroup[] {
    if (!CatalogProduct) return [];
    return CatalogProduct.map(p => this.getCatalogProductForm(p));
  }

  getCatalogProductForm(product?: CatalogProduct): FormGroup {
    return this.fb.group({
      product: new FormControl(product?.product._id, Validators.required),
      name: new FormControl(product?.name, Validators.required),
      cost: new FormControl(product?.cost, Validators.required)
    });
  }

  getProductForm(product: Product): FormGroup {
    return this.fb.group({
      product: new FormControl(product?._id, Validators.required),
      name: new FormControl(product?.name),
      cost: new FormControl(product?.sellingCost, Validators.required)
    });
  }

  handleAddProduct() {
    let userRef = this.dialog.open(ProductSearchComponent);
    userRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((product: Product | undefined) => {
        if (product && this.createCatalogGroup && this.products && !this.products.value.some((p: any) => p.product === product._id)) {
          this.products.push(this.getProductForm(product));
        }
      });
  }

  onSubmit() {
    if (this.createCatalogGroup?.invalid) return this.toastr.error('Incomplete form.')
    if (!this.createCatalogGroup || this.createCatalogGroup.invalid) return;

    const add = this.catalogService.createCatalog(this.createCatalogGroup.value);
    const edit = this.id ? this.catalogService.editCatalog(this.id, this.createCatalogGroup.value) : null;

    (!edit ? add : edit)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(newCatalogRes => {
        if (!newCatalogRes.data) return this.toastr.error('Failed to save catalog');
        this.toastr.success('Catalog saved successfully.');
        this.router.navigateByUrl('/inventory/catalog/store/default');
        return;
      })
    return;
  }

}