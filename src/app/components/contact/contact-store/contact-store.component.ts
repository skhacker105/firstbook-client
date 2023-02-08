import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AddEntity } from 'src/app/core/models/add-entity.model';
import { Contact } from 'src/app/core/models/contact.model';
import { ContactService } from 'src/app/core/services/contact.service';
import { HelperService } from 'src/app/core/services/helper.service';

interface IType {
  type: string,
  data: Contact[]
}

@Component({
  selector: 'app-contact-store',
  templateUrl: './contact-store.component.html',
  styleUrls: ['./contact-store.component.css']
})
export class ContactStoreComponent implements OnInit, OnDestroy {
  currentQuery: string = '';
  pageSize = 15;
  currentPage = 1;
  total = 30;
  maxPages = 8;
  querySub$: Subscription | undefined;
  routeChangeSub$: Subscription | undefined;
  contacts: Contact[] = [];
  groupView = false;
  typeGroups: IType[] = [];
  addEntity: AddEntity = { url: '/contact/create'};
  isComponentIsActive = new Subject();

  constructor(
    private route: ActivatedRoute,
    private contactService: ContactService,
    private helperService: HelperService
  ) { }

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
    this.contactService
      .search(query)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
        this.total = res.itemsCount ? res.itemsCount : 0;
        this.contacts = res.data ? res.data : [];
        this.divideIntoGroups();
      });
  }

  divideIntoGroups() {
    this.typeGroups = [];
    this.contacts.forEach(c => {
      let obj=this.typeGroups.find(t => t.type === c.type);
      if (!obj) {
        obj={ type: c.type, data: [] };
        this.typeGroups.push(obj);
      }
      obj.data.push(c);
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

  contactDeleted(contact: Contact) {
    this.initRequest(this.currentQuery);
  }
}
