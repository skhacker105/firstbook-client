// Decorators and Lifehooks
import { Component, OnInit } from '@angular/core';

// Services
import { ProductService } from 'src/app/core/services/product.service';

// Models
import { Product } from '../../../core/models/product.model';

const newestBooksQuery = '?sort={"creationDate":-1}&limit=5';
const bestRatedBooksQuery = '?sort={"currentRating":-1}&limit=5';
const mostPurchasedBooksQuery = '?sort={"purchasesCount":-1}&limit=5';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // newestBooks: Book[];
  // bestRatedBooks: Book[];
  // mostPurchasedBooks: Book[];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    // this.bookService
    //   .search(newestBooksQuery)
    //   .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
    //     this.newestBooks = res.data;
    //   });

    // this.bookService
    //   .search(bestRatedBooksQuery)
    //   .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
    //     this.bestRatedBooks = res.data;
    //   });

    // this.bookService
    //   .search(mostPurchasedBooksQuery)
    //   .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
    //     this.mostPurchasedBooks = res.data;
    //   });
  }

}
