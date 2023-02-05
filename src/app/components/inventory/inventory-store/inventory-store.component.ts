import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AddEntity } from 'src/app/core/models/add-entity.model';
import { HelperService } from 'src/app/core/services/helper.service';
import { ProductService } from 'src/app/core/services/product.service';

@Component({
  selector: 'app-inventory-store',
  templateUrl: './inventory-store.component.html',
  styleUrls: ['./inventory-store.component.css']
})
export class InventoryStoreComponent implements OnInit, OnDestroy {

  productIds: string[] = [];
  currentQuery: string = '';
  mybreakpoint: number = 1;
  pageSize = 15;
  currentPage = 1;
  total = 30;
  maxPages = 8;
  querySub$: Subscription | undefined;
  routeChangeSub$: Subscription | undefined;
  addEntity: AddEntity = { url: '/inventory/create'};

  constructor(
    private helperService: HelperService,
    private route: ActivatedRoute,
    private productService: ProductService
    ) {}

  ngOnInit(): void {
    this.calculateBreakpoint(window.innerWidth);
    this.routeChangeSub$ = this.route.params.subscribe((params) => {
      this.currentQuery = params['query'] ? params['query'] : '';
      this.initRequest(this.currentQuery);
    });

    this.querySub$ = this.helperService
      .searchQuery
      .subscribe(() => {
        this.currentPage = 1;
      });
  }

  handleResize(event: any) {
    this.calculateBreakpoint(event.target.innerWidth);
  }

  calculateBreakpoint(width: number) {
    this.mybreakpoint = width <= 400 ? 1 : width <= 800 ? 3 : 4;
  }

  initRequest(query: string): void {
    query = this.generateQuery(query);
    this.productService
      .search(query)
      .subscribe((res) => {
        this.total = res.itemsCount ? res.itemsCount : 0;
        this.productIds = res.data ? res.data : [];
      });
  }

  generateQuery(query: string): string {
    if (query === 'default') {
      return `?sort={"firstName":1}`
        + `&skip=${(this.currentPage - 1) * this.pageSize}`
        + `&limit=${this.pageSize}`;
    }

    return `?query={"searchTerm":"${query}"}`
      + `&sort={"creationDate":-1}`
      + `&skip=${(this.currentPage - 1) * this.pageSize}`
      + `&limit=${this.pageSize}`;
  }

  pageChanged(newPage: number): void {
    this.currentPage = newPage;
    this.initRequest(this.currentQuery);
  }

  ngOnDestroy(): void {
    this.routeChangeSub$ ? this.routeChangeSub$.unsubscribe() : null;
    this.querySub$ ? this.querySub$.unsubscribe() : null;
  }

}
