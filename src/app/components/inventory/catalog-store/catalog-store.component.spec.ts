import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogStoreComponent } from './catalog-store.component';

describe('CatalogStoreComponent', () => {
  let component: CatalogStoreComponent;
  let fixture: ComponentFixture<CatalogStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatalogStoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
