// Decorators and Lifehooks
import { Component, OnInit } from '@angular/core';

// Router
import { Router, ActivatedRoute } from '@angular/router';

// Services
import { BookService } from '../../../core/services/book.service';
import { CartService } from '../../../core/services/cart.service';
import { HelperService } from '../../../core/services/helper.service';

// Models
import { Book } from '../../../core/models/book.model';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css']
})
export class BookDetailsComponent implements OnInit {
  book: Book | undefined;
  bookId: string | undefined | null;
  userId: string | undefined;
  isLogged: boolean | undefined;
  isAdmin: boolean | undefined;
  isRated: boolean | undefined;
  isAdded: boolean | undefined;
  isBought: boolean | undefined;
  stars = ['', '', '', '', ''];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookService: BookService,
    private cartService: CartService,
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    this.bookId = this.route.snapshot.paramMap.get('bookId');
    this.isLogged = this.helperService.isLoggedIn();
    this.isAdmin = this.helperService.isAdmin();
    this.userId = this.helperService.getProfile()?.id;

    if (!this.bookId) return;
    this.bookService
      .getSingleBook(this.bookId)
      .subscribe((res) => {
        this.book = res.data;
        if (this.book?.currentRating)
          this.calcRating(this.book.currentRating);
      });
  }

  buyBook(): void {
    if (!this.bookId) return;
    this.cartService
      .addToCart(this.bookId)
      .subscribe(() => {
        this.helperService.cartStatus.next('add');
        this.isBought = true;
      }, () => {
        this.isBought = true;
      });
  }

  addToFavorites(): void {
    if (!this.bookId) return;
    this.bookService
      .addToFavourites(this.bookId)
      .subscribe(() => {
        this.isAdded = true;
      }, () => {
        this.isAdded = true;
      });
  }

  rateBook(rating: number): void {
    if (!this.bookId) return;
    if (!this.isRated) {
      this.isRated = true;
      this.bookService
        .rateBook(this.bookId, { rating: rating })
        .subscribe((res) => {
          if (!this.book || !res.data) return;
          this.book.currentRating = res.data.currentRating;
          this.book.ratedCount ? this.book.ratedCount++ : this.book.ratedCount = 0;
          this.book.currentRating ? this.calcRating(this.book.currentRating) : null;
        });
    }
  }

  calcRating(rating: number): void {
    this.stars = ['', '', '', '', ''];
    rating = Math.round(rating);
    for (let i = 0; i < rating; i++) {
      this.stars[i] = 'checked';
    }
  }

  resetRating(): void {
    if (!this.book?.currentRating) return
    this.calcRating(this.book.currentRating);
  }

  login(): void {
    this.router.navigate(['/user/login']);
  }

}
