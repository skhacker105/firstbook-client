import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { forkJoin, mergeMap, Observable, of } from 'rxjs';
import { ConfirmationDialogData } from '../../models/confirmation-dialog.model';
import { ItemImage } from '../../models/image';
import { Product, ProductSpecification } from '../../models/product.model';
import { ServerResponse } from '../../models/server-response.model';
import { ISpecs } from '../../models/specs';
import { User } from '../../models/user.model';
import { HelperService } from '../../services/helper.service';
import { ProductSpecsService } from '../../services/product-specs.service';
import { ProductService } from '../../services/product.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ImageViewComponent } from '../image-view/image-view.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  @Input('productId') id: string | undefined;
  product: Product | undefined;
  specs: ProductSpecification[] = [];
  unique_specs: ISpecs[] = [];
  mainImage: ItemImage | undefined;
  images: ItemImage[] = [];
  customOptions: OwlOptions | undefined;
  loggedInUser: User | undefined;
  isEditAllowed: boolean = false;

  constructor(
    private productService: ProductService,
    private productSpecsService: ProductSpecsService,
    private router: Router,
    private helperService: HelperService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUser();
    this.checkIfEditAllowed();
    this.carouselOptions();
    this.loadProductDetails();
  }

  loadLoggedInUser() {
    this.loggedInUser = this.helperService.getProfile();
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
            this.loadProductImages(productRes.data)
          ])
        })
      ).subscribe((res: any) => {
        this.specs = res[0] ? res[0].data : [];
        this.mainImage = res[1] ? res[1].data : undefined;
        this.images = res[2].map((r: any) => r.data)
        this.divideSpecsByCategory();
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

    confirmSetRef.afterClosed().subscribe((result: string) => {
      if (result && state) this.enableProduct()
      else if (result && !state) this.disableProduct()
    });
  }

  enableProduct() {
    if (!this.product) return;
    this.productService
      .enableProduct(this.product._id)
      .subscribe(res => {
        if (!this.product) return;
        this.product['disabled'] = false;
      });
  }

  disableProduct() {
    if (!this.product) return;
    this.productService
      .disableProduct(this.product._id)
      .subscribe(res => {
        if (!this.product) return;
        this.product['disabled'] = true;
      })
  }

  handleImageClick(image: any) {
    const imageViewRef=this.dialog.open(ImageViewComponent, {
      data: image.image
    });
  }
}
