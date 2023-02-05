// Decorators
import { Directive } from '@angular/core';

// Forms
import {
  AbstractControl,
  FormGroup,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
  ValidatorFn
} from '@angular/forms';

export function mustMatchValidator(): ValidatorFn {//ValidationErrors | null => {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPasssword = control.get('confirmPassword');
    return password && confirmPasssword && password.value !== confirmPasssword.value ?
      { 'mustMatch': true } : null;
  }
};

export const mustMatchValidatorFunc = (control: FormGroup): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPasssword = control.get('confirmPassword');

  return password && confirmPasssword && password.value !== confirmPasssword.value ? { 'mustMatch': true } : null;
};

@Directive({
  selector: '[appMustMatch]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: MustMatchDirective,
    multi: true
  }]
})
export class MustMatchDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return mustMatchValidatorFunc(control as FormGroup);
  }
}
