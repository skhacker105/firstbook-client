// Decorators and Lifehooks
import { Component, OnInit } from '@angular/core';

// Forms
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Router
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { BookService } from '../../../core/services/book.service';

@Component({
  selector: 'app-book-delete',
  templateUrl: './book-delete.component.html',
  styleUrls: ['./book-delete.component.css']
})
export class BookDeleteComponent implements OnInit {
  deleteBookForm: FormGroup | undefined;
  id: string | null | undefined;
  isComponentIsActive = new Subject();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookService: BookService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.id = this.route.snapshot.paramMap.get('bookId');

    if (!this.id) return;
    this.bookService
      .getSingleBook(this.id)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
        if (!this.deleteBookForm) return;
        this.deleteBookForm.patchValue({ ...res.data });
      });
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  initForm(): void {
    this.deleteBookForm = new FormGroup({
      'title': new FormControl('', [
        Validators.required
      ]),
      'author': new FormControl('', [
        Validators.required
      ]),
      'genre': new FormControl('', [
        Validators.required
      ]),
      'description': new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ]),
      'price': new FormControl('', [
        Validators.required,
        Validators.min(0)
      ])
    });
  }

  onSubmit(): void {
    if (!this.id) return;
    this.bookService
      .deleteBook(this.id)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(() => {
        this.router.navigate(['/home']);
      });
  }

}
