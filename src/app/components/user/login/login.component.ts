// Decorators and Lifehooks
import { Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';

// Forms
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

// Router
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';

// Services
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  @Input() returnResultOnly = false;
  loginForm: FormGroup = new FormGroup({
    'username': new FormControl('', [
      Validators.required
    ]),
    'password': new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(16)
    ]),
  });
  isComponentIsActive = new Subject();

  constructor(
    private userService: UserService,
    private router: Router,
    private helperService: HelperService,
    @Optional() private dialogRef: MatDialogRef<LoginComponent>
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  onSubmit(): void {
    this.loginForm.controls['username'].setValue(this.loginForm.controls['username'].value.trim())
    this.userService
      .login(this.loginForm.value)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(() => {
        this.helperService.statSessionWatch();
        if (!this.returnResultOnly)
          this.router.navigate(['/home']);
          else this.dialogRef?.close('done');
      });
  }

  get username(): AbstractControl | null {
    return this.loginForm.get('username');
  }

  get password(): AbstractControl | null {
    return this.loginForm.get('password');
  }

}
