// Decorators and Lifehooks
import { Component, TemplateRef, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

// Services
import { CommentService } from '../../services/comment.service';
import { BsModalService } from 'ngx-bootstrap/modal';

// Models
import { Comment } from '../../models/comment.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  @Input('bookId') bookId: string | undefined | null;
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
  lastDeleteId: string | undefined;
  action: string | undefined;

  constructor(
    private commentService: CommentService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    if (!this.bookId) return;

    this.commentService
      .getComments(this.bookId, this.comments.length.toString())
      .subscribe((res) => {
        this.comments = res.data ? res.data : [];
      });
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

  openRemoveModal(template: TemplateRef<any>, id: string): void {
    this.lastDeleteId = id;
    this.removeModalRef = this.modalService.show(
      template,
      { class: 'myModal modal-sm' }
    );
  }

  onSubmit(): void {
    if (this.isFromEdit) {
      this.modifyComment();
    } else {
      this.createComment();
    }
  }

  loadMoreComments(): void {
    if (!this.bookId) return;
    this.commentService
      .getComments(this.bookId, this.comments.length.toString())
      .subscribe((res) => {
        if (res.data && res.data?.length !== 0) {
          this.comments.splice(this.comments.length, 0, ...res.data);
        }
      });
  }

  createComment(): void {
    if (!this.bookId) return;
    this.commentService
      .addComment(this.bookId, this.commentForm.value)
      .subscribe((res) => {
        if (res.data)
          this.comments.unshift(res.data);
      });

    this.commentForm.reset();
  }

  modifyComment(): void {
    if (!this.lastEditId) return;
    const editedContent = this.commentForm.value.content;
    this.commentService
      .editComment(this.lastEditId, this.commentForm.value)
      .subscribe(() => {
        for (const c of this.comments) {
          if (c._id === this.lastEditId) {
            c.content = editedContent;
            break;
          }
        }
      });

    this.commentForm.reset();
  }

  removeComment(): void {
    if (!this.removeModalRef || !this.lastDeleteId) return;
    this.removeModalRef.hide();
    const delId = this.lastDeleteId;
    this.commentService
      .deleteComment(this.lastDeleteId)
      .subscribe(() => {
        this.comments = this.comments.filter(c => c._id !== delId);
      });
  }

}
