import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { mergeMap, of, Subject, takeUntil } from 'rxjs';
import { Catalog, CatalogProduct } from 'src/app/core/models/catalog.model';
import { ConfirmationDialogData } from 'src/app/core/models/confirmation-dialog.model';
import { ItemImage } from 'src/app/core/models/image';
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
  @ViewChild('fileInput') fileInput!: ElementRef;

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

  get usingBanner(): boolean | undefined {
    return this.createCatalogGroup?.value.config.useBanner;
  }

  get banner(): ItemImage | undefined {
    return (this.createCatalogGroup?.controls['config'] as FormGroup).controls['banner'].value;
  }

  get usingTitleBar(): boolean | undefined {
    return this.createCatalogGroup?.value.config.useTitleBar;
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
          if (catalogRes.data.config?.useBanner && catalogRes.data.config?.banner) this.loadCatalogBanner(catalogRes.data);
          else this.initCatalogForm(catalogRes.data);
        }
      });
  }

  loadCatalogBanner(catalog: Catalog) {
    if (catalog.config?.useBanner && catalog.config?.banner && typeof catalog.config.banner === 'string') {
      this.catalogService.getBanner(catalog.config.banner)
        .pipe(takeUntil(this.isComponentIsActive))
        .subscribe(bannerRes => {
          if (bannerRes.data && catalog.config) catalog.config.banner = bannerRes.data
          this.initCatalogForm(catalog);
        });
    } else this.initCatalogForm(catalog);
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
    const banner = catalog?.config?.banner;
    const image = banner && typeof banner != 'string' ? banner : undefined;
    this.createCatalogGroup = this.fb.group({
      name: new FormControl(catalog?.name, Validators.required),
      config: this.fb.group({
        useBanner: new FormControl(catalog?.config?.useBanner),
        useTitleBar: catalog?.config?.useTitleBar,
        banner: new FormControl({ value: image, disabled: catalog?.config?.useBanner ? false : true }),
        address: new FormControl({ value: catalog?.config?.address, disabled: catalog?.config?.useTitleBar ? false : true }),
        contact: new FormControl({ value: catalog?.config?.contact, disabled: catalog?.config?.useTitleBar ? false : true }),
        email: new FormControl({ value: catalog?.config?.email, disabled: catalog?.config?.useTitleBar ? false : true })
      }),
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

    const formValue = this.createCatalogGroup.value;
    delete formValue['config']['banner'];
    const add = this.catalogService.createCatalog(formValue);
    const edit = this.id ? this.catalogService.editCatalog(this.id, formValue) : null;

    (!edit ? add : edit)
      .pipe(mergeMap(newCatalogRes => {
        if (!newCatalogRes.data && (!this.usingBanner || !this.banner)) return of({ data: false })
        else if (newCatalogRes.data && (!this.usingBanner || !this.banner || this.banner._id)) return of({ data: true })
        else if (newCatalogRes.data && this.usingBanner && this.banner) return this.catalogService.saveBanner(newCatalogRes.data._id, this.banner)
        else return of({ data: false })
      }))
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

  handleUseTitleBarChange() {
    const config = this.createCatalogGroup?.controls['config'] as FormGroup;
    if (config) {
      this.usingTitleBar ? config.controls['email'].enable() : config.controls['email'].disable();
      this.usingTitleBar ? config.controls['contact'].enable() : config.controls['contact'].disable();
      this.usingTitleBar ? config.controls['address'].enable() : config.controls['address'].disable();
      this.usingBanner ? config.controls['banner'].enable() : config.controls['banner'].disable();
    }
  }

  onChangeFileInput(event: any) {
    if (!event || !event.target) return;

    const f: File = this.fileInput.nativeElement.files[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData: ItemImage = {
          _id: '',
          name: f.name,
          image: reader.result as string
        };
        (this.createCatalogGroup?.controls['config'] as FormGroup).controls['banner'].setValue(imageData);
      };
      reader.readAsDataURL(f);
    }
  }

  onClickFileInputButton() {
    if (!this.fileInput) return;
    this.fileInput.nativeElement.click();
  }

}
