import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { Catalog, CatalogProduct } from 'src/app/core/models/catalog.model';
import { ConfirmationDialogData } from 'src/app/core/models/confirmation-dialog.model';
import { Product } from 'src/app/core/models/product.model';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { ConfirmationDialogComponent } from 'src/app/core/shared/confirmation-dialog/confirmation-dialog.component';
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
        if (catalogRes.data) {
          this.fixSequenceNumbers(catalogRes.data);
          this.initCatalogForm(catalogRes.data);
        }
      });
  }

  fixSequenceNumbers(catalog: Catalog): void {
    if (!catalog.products) return;
    const sequencedProducts = catalog?.products.filter(p => p.sequence && p.sequence >= 0).sort((a, b) => a.sequence && b.sequence && a.sequence > b.sequence ? 1 : -1);
    sequencedProducts.forEach((p, i) => p.sequence = i);
    const nextStartIndex = sequencedProducts ? sequencedProducts.length : 0;
    const nonSequencedProducts = catalog?.products.filter(p => !p.sequence || p.sequence < 0).map((p, i) => { p.sequence = i + nextStartIndex; return p; });
    catalog.products = sequencedProducts.concat(nonSequencedProducts);
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
      cost: new FormControl(product?.cost, Validators.required),
      sequence: new FormControl(product?.sequence, Validators.required)
    });
  }

  getProductForm(product: Product): FormGroup {
    const products = this.products?.value as CatalogProduct[];
    const maxSequence = !products ? 0 : products.reduce((max, val) => val.sequence && val.sequence > max ? val.sequence : max, 0)
    return this.fb.group({
      product: new FormControl(product?._id, Validators.required),
      name: new FormControl(product?.name),
      cost: new FormControl(product?.sellingCost, Validators.required),
      sequence: new FormControl(maxSequence, Validators.required)
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

  handleDeleteProduct(i: number, product: Product) {
    const config: ConfirmationDialogData = {
      message: 'Are you sure to remove <b>' + product.name + '</b> from this catalog.',
      okDisplay: 'DELETE',
      cancelDisplay: 'Cancel'
    }
    let confrmRef = this.dialog.open(ConfirmationDialogComponent, {
      data: config
    });
    confrmRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((result: boolean | undefined) => result ? this.products?.removeAt(i) : null);
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

  drop(event: CdkDragDrop<Product[]>) {
    if (!this.products) return;
    let products = this.products.value as CatalogProduct[];
    moveItemInArray(products, event.previousIndex, event.currentIndex);
    products.forEach((p, i) => p.sequence = i);
    this.createCatalogGroup?.controls['products'].patchValue(products);
  }

}
