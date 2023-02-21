import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o/public_api';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, from, mergeMap, Observable, of, Subject, takeUntil } from 'rxjs';
import { ConfirmationDialogData } from 'src/app/core/models/confirmation-dialog.model';
import { ItemImage } from 'src/app/core/models/image';
import { Product, ProductClientCost, ProductSpecification } from 'src/app/core/models/product.model';
import { ServerResponse } from 'src/app/core/models/server-response.model';
import { ProductSpecsService } from 'src/app/core/services/product-specs.service';
import { ProductService } from 'src/app/core/services/product.service';
import { ConfirmationDialogComponent } from 'src/app/core/shared/confirmation-dialog/confirmation-dialog.component';
import { InputDialogComponent } from 'src/app/core/shared/input-dialog/input-dialog.component';
import { ISpecs } from 'src/app/core/models/specs';
import { HelperService } from 'src/app/core/services/helper.service';
import { ContactSearchComponent } from 'src/app/core/shared/client-search/contact-search.component';
import { Contact } from 'src/app/core/models/contact.model';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css']
})
export class ProductCreateComponent implements OnInit, OnDestroy {
  createProductForm: FormGroup | undefined;
  mainImage: ItemImage | undefined;
  images: ItemImage[] = [];
  unique_specs: ISpecs[] = [];
  id: string | null | undefined;
  product: Product | undefined;
  customOptions: OwlOptions | undefined;
  @ViewChild('fileInput') fileInput!: ElementRef;
  isComponentIsActive = new Subject();

  constructor(
    private productService: ProductService,
    private productSpecsService: ProductSpecsService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private helperService: HelperService) { }

  get specs(): FormArray {
    return this.createProductForm?.controls?.['specifications'] as FormArray;
  }

  get clientCosts(): FormArray {
    return this.createProductForm?.controls?.['clientCosts'] as FormArray;
  }

  get descriptionControl(): FormControl {
    return this.createProductForm?.controls?.['description'] as FormControl
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('productId');
    this.carouselOptions();
    this.loadProduct();
    this.helperService.showGlobalSearch = false;
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete();
    this.helperService.showGlobalSearch = true;
  }

  loadProduct(): void {
    if (!this.id) return this.initProductForm();

    this.productService
      .getSingleProduct(this.id)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((productRes) => {
        if (!this.id) return;

        this.product = productRes.data;
        this.initProductForm(productRes.data);
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
          let obj = new_unique_specs.find(s => s.name === d.category)
          if (!obj) {
            obj = {
              name: d.category,
              count: 0,
              isOpen: false
            }
            new_unique_specs.push(obj);
          }
          this.specs.push(this.newSpecForm(d));
          this.updateSpecCount(new_unique_specs, obj);
        });
        this.unique_specs = new_unique_specs;
      });
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

  initProductForm(product?: Product): void {
    this.createProductForm = this.fb.group({
      name: new FormControl(product?.name, Validators.required),
      description: new FormControl(product?.description),
      specifications: this.fb.array([]),
      purchaseCost: new FormControl(product?.purchaseCost),
      sellingCost: new FormControl(product?.sellingCost),
      clientCosts: this.fb.array(product?.clientCosts ? product.clientCosts.map(cc => this.newClientCostForm(cc)) : [])
    });
  }

  newClientCostForm(clientCost?: ProductClientCost): FormGroup {
    return this.fb.group({
      client: new FormControl(clientCost?.client, Validators.required),
      cost: new FormControl(clientCost?.cost, Validators.required)
    });
  }

  newSpecForm(spec?: ProductSpecification): FormGroup {
    return this.fb.group({
      _id: new FormControl(spec?._id),
      productId: new FormControl(spec?.productId),
      category: new FormControl(spec?.category, Validators.required),
      name: new FormControl(spec?.name, Validators.required),
      value: new FormControl(spec?.value, Validators.required),
      isImportant: new FormControl(spec?.isImportant)
    });
  }

  onSubmit(): void {
    const saveProd = this.saveProduct();
    if (saveProd) {
      saveProd.pipe(takeUntil(this.isComponentIsActive)).subscribe(savedProductRes => {
        if (!savedProductRes.data) return;

        const saveSpecs = this.saveSpecifications(savedProductRes.data);
        if (saveSpecs) {
          saveSpecs.pipe(takeUntil(this.isComponentIsActive)).subscribe(savedSpecsRes => {
            if (!savedProductRes.data) return;
            if (!this.mainImage) this.toastr.success('Item saved.');
            this.saveImages(savedProductRes.data);
          });
        } else {
          if (!this.mainImage) this.toastr.success('Item saved.');
          this.saveImages(savedProductRes.data);
        }
      });
    }
  }

  saveProduct(): Observable<ServerResponse<Product>> | undefined {
    if (!this.createProductForm) return;
    this.checkSpecsError();
    if (this.createProductForm.invalid) {
      this.toastr.error('Incomplete information cannot be submitted')
      return;
    }
    const data = this.createProductForm.value;
    delete data.specifications;
    if (!this.id) return this.productService.createProduct(this.createProductForm.value);
    else return this.productService.editProduct(this.id, this.createProductForm.value);
  }

  saveSpecifications(savedProduct: Product): Observable<ServerResponse<ProductSpecification>[]> | undefined {
    if (!savedProduct || !savedProduct._id) return;
    const add_subscriptions: Observable<ServerResponse<ProductSpecification>>[] = [];
    const edit_subscriptions: Observable<ServerResponse<ProductSpecification>>[] = [];
    this.specs.controls.forEach(c => {
      let ctrl = c as FormGroup;
      let saveSpecs = ctrl.value;
      saveSpecs['productId'] = savedProduct._id;
      if (ctrl.controls?.['_id']?.value && ctrl.controls?.['productId']?.value === savedProduct._id) {
        edit_subscriptions.push(this.productSpecsService.editProductSpecs(ctrl.controls?.['_id']?.value, saveSpecs));
      }
      else {
        delete saveSpecs._id;
        add_subscriptions.push(this.productSpecsService.createProductSpecs(savedProduct._id, saveSpecs));
      }
    });
    if (!add_subscriptions.length && !edit_subscriptions.length) return;
    return forkJoin(add_subscriptions.concat(edit_subscriptions));
  }

  saveImages(savedProduct: Product) {
    const subscriptions: Observable<any>[] = [];
    if (this.mainImage && !this.mainImage._id) subscriptions.push(this.productService.saveMainImage(savedProduct, this.mainImage));
    this.images.forEach(img => {
      if (!img._id) subscriptions.push(this.productService.saveImage(savedProduct, img));
    })
    if (subscriptions.length > 0)
      forkJoin(subscriptions).pipe(takeUntil(this.isComponentIsActive)).subscribe(results => this.reloadAfterSave(savedProduct));
    else this.reloadAfterSave(savedProduct)
  }

  reloadAfterSave(product: Product) {
    this.toastr.success('Item saved.');
    if (!this.id) this.router.navigate([`/inventory/edit/${product._id}`]);
    else this.loadProduct();
  }

  onClickFileInputButton() {
    if (!this.fileInput) return;
    this.fileInput.nativeElement.click();
  }

  onChangeFileInput(event: any) {
    if (!event || !event.target) return;

    [...this.fileInput.nativeElement.files].forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.images.push({
          _id: '',
          name: file.name,
          image: reader.result as string
        });
        this.images = JSON.parse(JSON.stringify(this.images));
        if (!this.mainImage && this.images && this.images.length > 0) this.mainImage = this.images.pop();
      };
      reader.readAsDataURL(file);
    });
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

  addSpecification() {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {
        title: 'New Category',
        inputLabel: 'Category',
        placeHolder: 'Physical, Technical ....'
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe((result: string) => {
      if (result) {
        if (!this.unique_specs.find(s => s.name === result)) {
          let newSpec = {
            name: result,
            count: 0,
            isOpen: false
          };
          this.unique_specs.push(newSpec);
          this.pushNewSpecForm(newSpec);
        } else this.toastr.error('Specification category ' + result + ' already exists.')
      }
    });
  }

  pushNewSpecForm(s: ISpecs, event?: any) {
    if (event) {
      event.stopPropagation();
      s.isOpen = true;
    }
    this.specs.push(this.newSpecForm({
      category: s.name,
      name: '',
      value: '',
      isImportant: false,
      _id: '',
      productId: this.id ? this.id : ''
    }));
    this.updateSpecCount(this.unique_specs, s);
  }

  updateSpecCount(unique_specs: ISpecs[], s: ISpecs) {
    const spec_data = unique_specs.find(spec => spec.name === s.name);
    if (!spec_data) {
      this.toastr.error('Spec category was not be added properly');
      return;
    }
    spec_data.count = spec_data.count + 1;
  }

  checkSpecsError() {
    if (!this.createProductForm) return;
    this.unique_specs.forEach(s => {
      s.error = this.hasError(s);
    });
  }

  hasError(spec: ISpecs): boolean {
    const specForms = this.specs.controls.filter(c => c.get('category')?.value === spec.name && c.invalid);
    return specForms && specForms.length > 0 ? true : false;
  }

  handleCategoryDelete(category: string, unique_index: number, event: any = null) {
    if (event) event.stopPropagation();
    let dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe((result: string) => {
      if (result) this.deleteSpecCategory(category, unique_index);
    });
  }

  deleteSpecCategory(category: string, unique_index: number) {
    let index = this.specs.controls.findIndex(g => {
      let ctrl = g as FormGroup;
      return ctrl.controls?.['category'].value === category
    });
    if (index >= 0) {
      this.deleteSpec(index)
        .pipe(takeUntil(this.isComponentIsActive)).subscribe(res => {
          this.removeDeletedSpec(index, unique_index);
          this.deleteSpecCategory(category, unique_index)
        });
    } else this.toastr.success('Specification deleted permanently');
  }

  handleSpecDelete(index: number, unique_index: number) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent)

    dialogRef.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe((result: string) => {
      if (result)
        this.deleteSpec(index)
          .pipe(takeUntil(this.isComponentIsActive)).subscribe(res => {
            this.removeDeletedSpec(index, unique_index);
            this.toastr.success('Specification deleted permanently');
          });
    });

  }

  deleteSpec(index: number): Observable<any> {
    const spec = this.specs.at(index) as FormGroup;
    let specid = spec.controls?.['_id'].value;
    if (specid)
      return this.productSpecsService.deleteProductSpecs(specid)
    else {
      return of(true);
    }
  }

  removeDeletedSpec(index: number, unique_index: number) {
    this.specs.removeAt(index);
    this.unique_specs[unique_index].count = this.unique_specs[unique_index].count - 1;
    if (!this.unique_specs[unique_index].count) this.unique_specs.splice(unique_index, 1);
  }

  handleMainImageDelete() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent)

    dialogRef.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe((result: string) => {
      if (!result) return;
      if (!this.product || !this.mainImage?._id) {
        this.mainImage = undefined;
        return;
      }
      this.productService.deleteMainImage(this.product)
        .pipe(takeUntil(this.isComponentIsActive)).subscribe(res => {
          this.mainImage = undefined;
          this.toastr.success('Main Image deleted permanently');
        })
    });
  }

  handleImageDelete(id: string) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent)

    dialogRef.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe((result: string) => {
      if (!result) return;
      this.deleteImage(id);
    });
  }

  deleteImage(id: string) {
    let image = this.images.find(img => img._id === id);
    if (image) {
      if (!image._id) this.removeDeletedImage(id);
      else {
        this.productService.deleteImage(id)
          .pipe(takeUntil(this.isComponentIsActive)).subscribe(res => this.removeDeletedImage(id));
      }
    }
  }

  removeDeletedImage(id: string) {
    let index = this.images.findIndex(img => img._id === id);
    if (index > -1) {
      this.images.splice(index, 1);
      this.images = JSON.parse(JSON.stringify(this.images));
    }
  }

  handleSetMainImage(id: string) {
    let confirmData = new ConfirmationDialogData('Are you sure to set it as main Image');
    let confirmSetRef = this.dialog.open(ConfirmationDialogComponent, {
      data: confirmData
    });

    confirmSetRef.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe((result: string) => {
      if (result) this.setMainImage(id);
    });
  }

  setMainImage(id: string) {
    let image = this.images.find(img => img._id === id);
    if (!image || !this.product) return;

    let saveMainImage = this.productService.saveMainImage(this.product, image);
    let deleteImage = this.productService.deleteImage(id);
    let obs: Observable<any> | undefined;

    if (this.mainImage) {
      let deleteMainImage = this.mainImage._id ? this.productService.deleteMainImage(this.product) : from([]);
      let saveImage = this.productService.saveImage(this.product, this.mainImage);
      obs = deleteMainImage
        .pipe(mergeMap(r => saveMainImage
          .pipe(mergeMap(r1 => deleteImage
            .pipe(mergeMap(r2 => saveImage))))));
    } else {
      obs = saveMainImage
        .pipe(mergeMap(r => deleteImage));
    }
    if (obs) obs.pipe(takeUntil(this.isComponentIsActive)).subscribe(res => this.loadProduct());
  }

  handleEditCategory(category: string, e: any) {
    e.stopPropagation();
    let newCategoryNameRef = this.dialog.open(InputDialogComponent, {
      data: {
        title: 'Edit Category',
        inputLabel: 'Category',
        placeHolder: 'Physical, Technical ....',
        initialValue: category
      }
    });


    newCategoryNameRef.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe((result: string) => {
      if (result) {
        this.updateCategoryName(category, result);
      }
    });
  }

  updateCategoryName(from: string, to: string) {
    if (from === to) return;
    const specs: ProductSpecification[] = this.specs.value;
    if (specs.find(s => s.category === to))
      this.toastr.error('Category name ' + to + ' already exists for this product', 'Category not updated');
    else {
      specs.forEach(s => s.category = s.category === from ? to : s.category);
      this.specs.patchValue(specs);
      let us = this.unique_specs.find(s => s.name === from);
      us ? us.name = to : null;
    }
  }

  handleAddNewClientCost() {
    const contactSearchRef = this.dialog.open(ContactSearchComponent);
    contactSearchRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((result: Contact | undefined) => {
        if (result) {
          if (result.type != this.helperService.contactTypes.client) {
            this.toastr.error('Please select only client type contact.');
            this.handleAddNewClientCost();
          } else {
            const newForm = this.newClientForm(result);
            if (newForm) this.clientCosts.push(newForm);
          }
        }
      });
  }

  newClientForm(client: Contact): FormGroup | undefined {
    if (this.clientCosts.value.some((cc: ProductClientCost) => cc.client._id === client._id)) {
      this.toastr.show('This client is already in your client cost list.')
      return undefined;
    }
    return this.fb.group({
      client: new FormControl(client, Validators.required),
      cost: new FormControl(
        this.createProductForm
          ? this.createProductForm.controls['sellingCost'].value
          : this.product && this.product.sellingCost
            ? this.product.sellingCost
            : 0, Validators.required
      )
    });
  }

  handleDeleteClientCost(clientId: string) {
    let confirmData = new ConfirmationDialogData('Are you sure to delete this cost specific to this client?');
    let confirmSetRef = this.dialog.open(ConfirmationDialogComponent, {
      data: confirmData
    });

    confirmSetRef.afterClosed()
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((result: string) => {
        if (result) this.deleteClientCost(clientId);
      });
  }

  deleteClientCost(clientId: string) {
    let currentClients = this.clientCosts.value as ProductClientCost[];
    const clientAt = currentClients.findIndex(cc => cc.client._id === clientId);
    this.clientCosts.removeAt(clientAt);
  }
}
