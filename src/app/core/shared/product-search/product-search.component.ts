import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, filter, map, Observable, switchMap, tap } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit {

  pageSize = 500;
  currentPage = 1;
  productChangeSub$: Observable<Product[]> | undefined;
  product: FormControl = new FormControl<Product | undefined>(undefined);

  constructor(
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductSearchComponent>) { }

  ngOnInit(): void {
    this.addUserChangeSubscription();
  }

  addUserChangeSubscription() {
    this.productChangeSub$ = this.product.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      filter(txt => !!txt),
      switchMap(txt => {
        return this.productService.searchProducts(this.generateQuery(txt)).pipe(
          map(res => res.data ? res.data : [])
        );
      })
    );
  }

  generateQuery(query: string): string {
    if (query === 'default') {
      return `?sort={"name":1}`
        + `&skip=${(this.currentPage - 1) * this.pageSize}`
        + `&limit=${this.pageSize}`;
    }

    return `?query={"searchTerm":"${query}"}`
      + `&sort={"name":1}`
      + `&skip=${(this.currentPage - 1) * this.pageSize}`
      + `&limit=${this.pageSize}`;
  }

  handleProductSelection() {
    this.dialogRef.close(this.product.value);
  }

  getOptionText(option: Product) {
    if (!option) return '';
    return option.name;
  }
}
