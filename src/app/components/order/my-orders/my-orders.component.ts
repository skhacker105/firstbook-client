import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Order } from 'src/app/core/models/order.model';
import { HelperService } from 'src/app/core/services/helper.service';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit, OnDestroy {

  currentQuery: string = '';
  pageSize = 15;
  currentPage = 1;
  total = 30;
  querySub$: Subscription | undefined;
  routeChangeSub$: Subscription | undefined;
  isComponentIsActive = new Subject();
  orders: Order[] = [];

  constructor(
    private helperService: HelperService,
    private route: ActivatedRoute,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.routeChangeSub$ = this.route.params
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe((params) => {
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
    this.orderService
      .getOrders(query)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((orderRes) => {
        this.total = orderRes.itemsCount ? orderRes.itemsCount : 0;
        if (!orderRes.data) return;
        this.orders = orderRes.data;
      });
  }

  generateQuery(query: string): string {
    if (query === 'default') {
      return `?sort={"creationDate":-1}`
        + `&skip=${(this.currentPage - 1) * this.pageSize}`
        + `&limit=${this.pageSize}`
        + (!this.helperService.isAdmin() ? `&createdBy=${this.helperService.getProfile()?.id}` : '');
    }

    return `?query={"searchTerm":"${query}"}`
      + `&sort={"creationDate":-1}`
      + `&skip=${(this.currentPage - 1) * this.pageSize}`
      + `&limit=${this.pageSize}`;
  }

}
