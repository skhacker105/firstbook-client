import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subject, takeUntil } from 'rxjs';
import { Catalog } from '../../models/catalog.model';
import { User } from '../../models/user.model';
import { HelperService } from '../../services/helper.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit, OnDestroy {

  @Input() catalog: Catalog | undefined;
  isComponentIsActive = new Subject();
  isAdmin = false;
  isEditAllowed: boolean = false;
  loggedInUser: User | undefined;
  expanded = false;
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

  constructor(private productService: ProductService, private helperService: HelperService) { }

  ngOnInit(): void {
    this.isAdmin = this.helperService.isAdmin();
    this.loggedInUser = this.helperService.getProfile();
    this.checkIfEditAllowed();
    this.loadImage();
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete();
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
            p.product.loadedImage = imageRes.data;
          })
    });
  }
}
