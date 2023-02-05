// Decorators and Lifehooks
import { Component, OnInit, OnDestroy } from '@angular/core';

// Router
import { ActivatedRoute, Router } from '@angular/router';

// Forms
import { FormGroup, FormControl, AbstractControl, Validators, FormBuilder } from '@angular/forms';

// Services
import { UserService } from '../../../core/services/user.service';
import { CommentService } from '../../../core/services/comment.service';
import { HelperService } from '../../../core/services/helper.service';

// RXJS
import { Subscription } from 'rxjs';

// Custom Validators
import { isUrlValidator } from '../../../core/directives/is-url.directive';

// Models
import { User } from '../../../core/models/user.model';
import { Comment } from '../../../core/models/comment.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | undefined;
  comments: Comment[] = [];
  avatarForm: FormGroup = new FormGroup({
    'avatar': new FormControl('', [
      Validators.required,
      isUrlValidator
    ])
  });
  routeChangeSub$: Subscription | undefined;
  currentUserId: string | undefined;
  isAdmin: boolean = false;
  editUserForm: FormGroup | undefined;
  editable = false;
  ownProfile = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commentService: CommentService,
    private userService: UserService,
    private helperService: HelperService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.evaluateEditable();
    this.routeChangeSub$ = this.route.params.subscribe((params) => {
      let username = params['username'];
      if (username === 'ME') {
        username = this.helperService.getProfile()?.username;
      }

      this.userService
        .getProfile(username)
        .subscribe((res) => {
          this.user = res.data;
          this.isAdmin = this.helperService.isAdmin() && this.helperService.getProfile()?.id != this.user?.id;
          this.ownProfile = this.helperService.getProfile()?.username === this.user?.username

          this.initUserForm(this.user);
          this.getComments();
        });
    });

    this.isAdmin = this.helperService.isAdmin();
    this.currentUserId = this.helperService.getProfile()?.id;

  }

  evaluateEditable() {
    this.route.url.subscribe(urlSegments => {
      this.editable = urlSegments.some(seg => seg.path === 'edit');
    });
  }

  initUserForm(user?: User) {
    this.editUserForm = this.fb.group({
      id: new FormControl(user?.id),
      isCommentsBlocked: new FormControl(user?.isCommentsBlocked),
      firstName: new FormControl({ value: user?.firstName, disabled: !this.editable }),
      lastName: new FormControl({ value: user?.lastName, disabled: !this.editable }),
      contact1: new FormControl({ value: user?.contact1, disabled: !this.editable }),
      contact2: new FormControl({ value: user?.contact2, disabled: !this.editable }),
      address: new FormControl({ value: user?.address, disabled: !this.editable })
    });
  }

  ngOnDestroy(): void {
    this.routeChangeSub$ ? this.routeChangeSub$.unsubscribe() : null;
  }

  getComments(): void {
    if (!this.user?.id) return;
    this.commentService
      .getLatestFiveComments(this.user.id)
      .subscribe((res) => {
        this.comments = res.data ? res.data : [];
      });
  }

  onSubmit(): void {
    if (!this.editUserForm) return
    this.userService.updateProfile(this.editUserForm.value)
      .subscribe(res => {
        if (!this.user) return;
        if (this.user.isCommentsBlocked != this.editUserForm?.controls['isCommentsBlocked'].value)
          this.editUserForm?.controls['isCommentsBlocked'].value ? this.blockComments(this.user.id) : this.unblockComments(this.user.id);
        this.router.navigate(['/user/profile/', this.user.username]);
      });
  }

  handleCommentBlockChange() {
    if (this.editable || !this.isAdmin || !this.user) return;
    this.editUserForm?.controls['isCommentsBlocked'].value ? this.blockComments(this.user.id) : this.unblockComments(this.user.id);
  }

  changeUserAvatar(): void {
    if (!this.user?.id) return;
    const newAvatar = this.avatar?.value;

    const payload = {
      id: this.user.id,
      avatar: newAvatar
    };

    this.userService
      .changeAvatar(payload)
      .subscribe(() => {
        if (this.user?.avatar)
          this.user.avatar = newAvatar;
        this.avatarForm.reset();
      });
  }

  blockComments(id: string): void {
    this.userService
      .blockComments(id)
      .subscribe();
  }

  unblockComments(id: string): void {
    this.userService
      .unblockComments(id)
      .subscribe();
  }

  get avatar(): AbstractControl | null {
    return this.avatarForm.get('avatar');
  }

}
