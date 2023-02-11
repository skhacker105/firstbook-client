import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { mustMatchValidatorFunc } from 'src/app/core/directives/must-match.directive';
import { HelperService } from 'src/app/core/services/helper.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.css']
})
export class PasswordRecoveryComponent implements OnInit, OnDestroy {

  emailForm: FormGroup | undefined;
  otpForm: FormGroup | undefined;
  newPasswordForm: FormGroup | undefined;

  emailVerified = false;
  verifiedUserId: string | undefined;
  otpVerified = false;


  get password(): AbstractControl | null | undefined {
    return this.newPasswordForm?.get('password');
  }

  get confirmPassword(): AbstractControl | null | undefined {
    return this.newPasswordForm?.get('confirmPassword');
  }

  constructor(
    private helperService: HelperService,
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.helperService.showGlobalSearch = false;
    this.initEmailForm();
  }

  ngOnDestroy(): void {
    this.helperService.showGlobalSearch = true;
  }

  initEmailForm() {
    this.emailForm = this.fb.group({
      toFind: new FormControl('', Validators.required)
    });
  }

  onEmailFormSubmit() {
    if (!this.emailForm || this.emailForm.invalid) return;

    this.userService.verifyAndSendOTP(this.emailForm.value).subscribe(res => {
      if (res.data) {
        this.emailVerified = true;
        this.verifiedUserId = res.data;
        this.toastr.success('User verified.');
        this.initOTPForm();
      }
    })
  }

  initOTPForm() {
    this.otpForm = this.fb.group({
      otp: new FormControl('', Validators.required)
    });
  }

  onOTPFormSubmit() {
    if (!this.otpForm || this.otpForm.invalid || !this.verifiedUserId) return;

    this.userService.verifyOTP(this.verifiedUserId, this.otpForm.value).subscribe(res => {
      if (!res.data) this.toastr.error('OTP verification failed');
      else {
        this.otpVerified = true;
        this.initPasswordResetForm();
      }
    });
  }

  initPasswordResetForm() {
    this.newPasswordForm = this.fb.group({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(16)
      ]),
      confirmPassword: new FormControl('', Validators.required)
    }, { validators: mustMatchValidatorFunc});
  }

  onNewPasswordFormSubmit() {
    if (!this.newPasswordForm || this.newPasswordForm.invalid || !this.verifiedUserId) return;

    this.userService.resetPassword(this.verifiedUserId, this.newPasswordForm.value).subscribe(res => {
      if (!res.data) this.toastr.error('OTP verification failed');
      else {
        this.toastr.success('Password changed. Continue with login');
        this.router.navigateByUrl('/user/login');
      }
    });
  }

}
