import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { forkJoin, Observable } from 'rxjs';
import { ItemImage } from 'src/app/core/models/image';
import { Product, ProductSpecification } from 'src/app/core/models/product.model';
import { ServerResponse } from 'src/app/core/models/server-response.model';
import { ISpecs } from 'src/app/core/models/specs';
import { User } from 'src/app/core/models/user.model';
import { HelperService } from 'src/app/core/services/helper.service';
import { ProductSpecsService } from 'src/app/core/services/product-specs.service';
import { ProductService } from 'src/app/core/services/product.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

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

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private productSpecsService: ProductSpecsService,
    private router: Router,
    private helperService: HelperService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('productId');
    this.isLogged = this.helperService.isLoggedIn();
    this.isAdmin = this.helperService.isAdmin();
    this.userId = this.helperService.getProfile()?.id;

    this.loadLoggedInUser();
    this.carouselOptions();
    this.loadProduct();
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
      .subscribe((productRes) => {
        if (!this.id) return;

        this.product = productRes.data;
        this.loadProductSpecs(productRes.data);
        this.loadProductMainImage(productRes.data);
        this.loadProductImages(productRes.data);
      });
  }

  loadProductSpecs(loadedProduct?: Product) {
    if (!loadedProduct) return;
    this.productSpecsService
      .getProductSpecs(loadedProduct._id)
      .subscribe(specsRes => {

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
      .subscribe(fileRes => {
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
        .subscribe(imgsRes => {
          imgsRes.forEach(imgRes => {
            if (imgRes.data)
              this.images.push(imgRes.data);
            this.images = JSON.parse(JSON.stringify(this.images));
          });
        });
    }
  }

  goToEditDetail() {
    this.router.navigate([`/inventory/edit/${this.id}`]);
  }

  checkIfEditAllowed() {
    this.isEditAllowed = this.loggedInUser?._id === this.product?.createdBy;
  }

  loadLoggedInUser() {
    this.loggedInUser = this.helperService.getProfile();
  }

  rateProduct(rating: number) {
    if (!this.id) return;
    this.productService
      .rateProduct(this.id, { rating: rating })
      .subscribe((res) => {
        if (!this.product || !res.data) return;
        this.product = res.data;
      });
  }

}
