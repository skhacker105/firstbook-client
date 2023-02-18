import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Catalog } from 'src/app/core/models/catalog.model';
import { User } from 'src/app/core/models/user.model';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-catalog-details',
  templateUrl: './catalog-details.component.html',
  styleUrls: ['./catalog-details.component.css']
})
export class CatalogDetailsComponent implements OnInit, OnDestroy {

  id: string | null | undefined;
  catalog: Catalog | undefined;
  isEditAllowed: boolean = false;
  loggedInUser: User | undefined;
  isAdmin = false;
  userId: string | undefined;
  isLogged: boolean | undefined;
  isComponentIsActive = new Subject();

  constructor(
    private route: ActivatedRoute,
    private catalogService: CatalogService,
    private router: Router,
    private helperService: HelperService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('catalogId');
    this.isLogged = this.helperService.isLoggedIn();
    this.isAdmin = this.helperService.isAdmin();
    this.userId = this.helperService.getProfile()?.id;
    this.loadLoggedInUser();
    this.loadCatalog();
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  goToEditDetail() {
    this.router.navigate([`/inventory/catalog/edit/${this.id}`]);
  }

  checkIfEditAllowed() {
    this.isEditAllowed = this.loggedInUser?.id === this.catalog?.createdBy || this.loggedInUser?._id === this.catalog?.createdBy;
  }

  loadLoggedInUser() {
    this.loggedInUser = this.helperService.getProfile();
  }

  loadCatalog() {
    if (!this.id) return;
    this.catalogService.getSingleCatalog(this.id)
      .pipe(takeUntil(this.isComponentIsActive))
      .subscribe(catalogRes => {
        this.catalog = catalogRes.data;
      });
  }

}
