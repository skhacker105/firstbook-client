// Decorators and Lifehooks
import { Component, TemplateRef, Input, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

// Services
import { BsModalService } from 'ngx-bootstrap/modal';
import { ProductService } from '../../services/product.service';

// Models
import { Comment } from '../../models/comment.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogData } from '../../models/confirmation-dialog.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { User } from '../../models/user.model';
import { HelperService } from '../../services/helper.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-comment',
  templateUrl: './product-comment.component.html',
  styleUrls: ['./product-comment.component.css']
})
export class ProductCommentComponent implements OnInit, OnDestroy {
  @Input('productId') productId: string | undefined | null;
  @Input('isLogged') isLogged: boolean | undefined = false;
  @Input('isAdmin') isAdmin: boolean | undefined = false;
  @Input('userId') userId: string | undefined | null;
  commentForm: FormGroup = new FormGroup({
    'content': new FormControl('', Validators.required)
  });;
  commentModalRef: BsModalRef | undefined;
  removeModalRef: BsModalRef | undefined;
  comments: Comment[] = [];
  isFromEdit: boolean = false;
  lastEditId: string | undefined;
  action: string | undefined;
  isComponentIsActive = new Subject();

  constructor(
    private productService: ProductService,
    private modalService: BsModalService,
    public dialog: MatDialog,
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    if (!this.productId) return;

    this.productService
      .getComments(this.productId, this.comments.length.toString())
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
        this.comments = res.data ? res.data : [];
      });
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  openFormModal(template: TemplateRef<any>, id?: string): void {
    if (id) {
      let content = '';
      this.isFromEdit = true;
      this.lastEditId = id;
      for (const c of this.comments) {
        if (c._id === id) {
          content = c.content;
          break;
        }
      }
      this.action = 'Edit';
      this.commentForm.patchValue({ content: content });
    } else {
      this.action = 'Create';
      this.isFromEdit = false;
      this.commentForm.patchValue({ content: '' });
    }

    this.commentModalRef = this.modalService.show(
      template,
      { class: 'myModal' }
    );
  }

  openRemoveModal(id: string): void {
    let confirmData = new ConfirmationDialogData('Do you really want to delete your comment?');
    let confirmSetRef = this.dialog.open(ConfirmationDialogComponent, {
      data: confirmData
    });

    confirmSetRef.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe((result: string) => {
      if (result) this.removeComment(id)
    });
  }

  onSubmit(): void {
    if (this.isFromEdit) {
      this.modifyComment();
    } else {
      this.createComment();
    }
  }

  loadMoreComments(): void {
    if (!this.productId) return;
    this.productService
      .getComments(this.productId, this.comments.length.toString())
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
        if (res.data && res.data?.length !== 0) {
          this.comments.splice(this.comments.length, 0, ...res.data);
        }
      });
  }

  createComment(): void {
    if (!this.productId) return;
    this.productService
      .addComment(this.productId, this.commentForm.value)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
        if (res.data)
          this.comments.unshift(res.data);
      });

    this.commentForm.reset();
  }

  modifyComment(): void {
    if (!this.lastEditId) return;
    const editedContent = this.commentForm.value.content;
    this.productService
      .editComment(this.lastEditId, this.commentForm.value)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(() => {
        for (const c of this.comments) {
          if (c._id === this.lastEditId) {
            c.content = editedContent;
            break;
          }
        }
      });

    this.commentForm.reset();
  }

  removeComment(delId: string): void {
    this.productService
      .deleteComment(delId)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(() => {
        this.comments = this.comments.filter(c => c._id !== delId);
      });
  }

  getUserName(c: Comment): string {
    if (this.helperService.getProfile()?.id === c.user._id) return 'ME'
    return c.user.username;
  }

}
