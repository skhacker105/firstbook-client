import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Catalog } from 'src/app/core/models/catalog.model';
import { CatalogService } from 'src/app/core/services/catalog.service';

@Component({
  selector: 'app-catalog-details',
  templateUrl: './catalog-details.component.html',
  styleUrls: ['./catalog-details.component.css']
})
export class CatalogDetailsComponent implements OnInit, OnDestroy {

  id: string | null | undefined;
  catalog: Catalog | undefined;
  isComponentIsActive = new Subject();

  constructor(
    private route: ActivatedRoute,
    private catalogService: CatalogService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('catalogId');
    this.loadCatalog();
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
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
