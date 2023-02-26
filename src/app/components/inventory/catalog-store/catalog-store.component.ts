import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AddEntity } from 'src/app/core/models/add-entity.model';
import { Catalog } from 'src/app/core/models/catalog.model';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-catalog-store',
  templateUrl: './catalog-store.component.html',
  styleUrls: ['./catalog-store.component.css']
})
export class CatalogStoreComponent implements OnInit, OnDestroy {

  querySub$: Subscription | undefined;
  routeChangeSub$: Subscription | undefined;
  addEntity: AddEntity = { url: '/inventory/catalog/create' };
  currentQuery: string = '';
  pageSize = 15;
  currentPage = 1;
  total = 30;
  maxPages = 8;
  isComponentIsActive = new Subject();
  catalogs: Catalog[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private helperService: HelperService,
    private catalogService: CatalogService
    ) {}

  ngOnInit(): void {
    this.routeChangeSub$ = this.route.params.pipe(takeUntil(this.isComponentIsActive)).subscribe((params) => {
      this.currentQuery = params['query'] ? params['query'] : '';
      this.initRequest(this.currentQuery);
    });

    this.querySub$ = this.helperService
      .searchQuery
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(() => {
        this.currentPage = 1;
      });
  }

  ngOnDestroy(): void {
    this.routeChangeSub$ ? this.routeChangeSub$.unsubscribe() : null;
    this.querySub$ ? this.querySub$.unsubscribe() : null;
    this.isComponentIsActive.complete()
  }

  initRequest(query: string): void {
    query = this.generateQuery(query);
    this.catalogService
      .search(query)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
        this.total = res.itemsCount ? res.itemsCount : 0;
        this.catalogs = res.data ? res.data : [];
      });
  }

  generateQuery(query: string): string {
    if (query === 'default') {
      return `?sort={"createdDate":-1}`
        + `&skip=${(this.currentPage - 1) * this.pageSize}`
        + `&limit=${this.pageSize}`
        + (!this.helperService.isAdmin() ? `&createdBy=${this.helperService.getProfile()?.id}` : '');
    }

    return `?query={"searchTerm":"${query}"}`
      + `&sort={"createdDate":-1}`
      + `&skip=${(this.currentPage - 1) * this.pageSize}`
      + `&limit=${this.pageSize}`;
  }
}
