// Decorators and Lifehooks
import { Component, OnDestroy, OnInit } from '@angular/core';

// Forms
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';

// Router
import { Router } from '@angular/router';

// Services
import { BookService } from '../../../core/services/book.service';

// Custom Validators
import { isUrlValidator } from '../../../core/directives/is-url.directive';
import { isIsbnValidator } from '../../../core/directives/is-isbn.directive';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-book-create',
  templateUrl: './book-create.component.html',
  styleUrls: ['./book-create.component.css']
})
export class BookCreateComponent implements OnInit, OnDestroy {
  createBookForm: FormGroup | undefined;
  isComponentIsActive = new Subject();

  constructor(
    private router: Router,
    private bookService: BookService
  ) { }

  ngOnInit(): void {
    this.createBookForm = new FormGroup({
      'title': new FormControl('', [
        Validators.required
      ]),
      'author': new FormControl('', [
        Validators.required
      ]),
      'genre': new FormControl('', [
        Validators.required
      ]),
      'year': new FormControl('', [
        Validators.required
      ]),
      'description': new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ]),
      'cover': new FormControl('', [
        Validators.required,
        isUrlValidator
      ]),
      'isbn': new FormControl('', [
        Validators.required,
        isIsbnValidator
      ]),
      'pagesCount': new FormControl('', [
        Validators.required,
        Validators.min(0)
      ]),
      'price': new FormControl('', [
        Validators.required,
        Validators.min(0)
      ])
    });
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  onSubmit(): void {
    if (!this.createBookForm) return;
    this.bookService
      .createBook(this.createBookForm.value)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
        if (!res.data) return;
        this.router.navigate([`/book/details/${res.data._id}`]);
      });
  }

  get title(): AbstractControl | null | undefined {
    return this.createBookForm?.get('title');
  }

  get author(): AbstractControl | null | undefined {
    return this.createBookForm?.get('author');
  }

  get genre(): AbstractControl | null | undefined {
    return this.createBookForm?.get('genre');
  }

  get year(): AbstractControl | null | undefined {
    return this.createBookForm?.get('year');
  }

  get description(): AbstractControl | null | undefined {
    return this.createBookForm?.get('description');
  }

  get cover(): AbstractControl | null | undefined {
    return this.createBookForm?.get('cover');
  }

  get isbn(): AbstractControl | null | undefined {
    return this.createBookForm?.get('isbn');
  }

  get pagesCount(): AbstractControl | null | undefined {
    return this.createBookForm?.get('pagesCount');
  }

  get price(): AbstractControl | null | undefined {
    return this.createBookForm?.get('price');
  }

}
