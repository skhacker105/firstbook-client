import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';
import { Contact } from 'src/app/core/models/contact.model';
import { OptionalDialogDataOption, OptionDialogData } from 'src/app/core/models/option-dialog-data.model';
import { User } from 'src/app/core/models/user.model';
import { ContactService } from 'src/app/core/services/contact.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { UserService } from 'src/app/core/services/user.service';
import { OptionDialogComponent } from 'src/app/core/shared/option-dialog/option-dialog.component';

@Component({
  selector: 'app-contact-add-edit',
  templateUrl: './contact-add-edit.component.html',
  styleUrls: ['./contact-add-edit.component.css']
})
export class ContactAddEditComponent implements OnInit, OnDestroy {
  createContactForm: FormGroup | undefined;
  id: string | null | undefined;
  userChangeSub$: Observable<User[]> | undefined;
  pageSize = 5;
  currentPage = 1;
  fields = ['firstName', 'lastName', 'contact1', 'contact2', 'address'];
  overwriteOperations: OptionDialogData = {
    title: 'Select appropriate action',
    options: [
      { key: 'keep', message: 'Keep my data as it is.', icon: 'back_hand' },
      { key: 'over', message: 'Overwrite my data with selected user information', icon: 'content_copy' },
      { key: 'update', message: 'Update only empty field', icon: 'copy_all' }
    ]
  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private contactService: ContactService,
    public userService: UserService,
    public helperService: HelperService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('contactId');
    this.initUserForm();
    if (!this.id) return;

    this.contactService
      .getSingleContact(this.id)
      .subscribe((res) => {
        this.createContactForm ? this.createContactForm.patchValue({ ...res.data }) : null;
      });
  }

  initUserForm() {
    this.createContactForm = this.fb.group({
      appUserId: new FormControl(),
      title: new FormControl(''),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl(''),
      type: new FormControl('', Validators.required),
      contact1: new FormControl(''),
      contact2: new FormControl(''),
      address: new FormControl('')
    });
    this.addUserChangeSubscription(this.createContactForm);
  }

  addUserChangeSubscription(form: FormGroup) {
    this.userChangeSub$ = form.get('appUserId')!.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(1000),
      filter(txt => !!txt),
      switchMap(txt => {
        return this.userService.search(this.generateQuery(txt)).pipe(
          map(res => res.data ? this.removeLoggedInUser(res.data) : [])
        );
      })
    );
  }

  onSubmit(): void {
    if (!this.createContactForm) return;
    if (this.createContactForm.invalid) {
      this.toastr.error('Incomplete information cannot be submitted')
      return;
    }
    if (this.createContactForm.controls['appUserId'].value)
      this.createContactForm.controls['appUserId'].setValue(this.createContactForm.controls['appUserId'].value._id)
    if (!this.id) {
      this.contactService
        .createContact(this.createContactForm.value)
        .subscribe((res) => {
          if (!res.data) return;
          this.router.navigate([`/contact`]);
        });
    } else {
      this.contactService
        .editContact(this.id, this.createContactForm.value)
        .subscribe((res) => {
          res.data ? this.router.navigateByUrl(`/contact`) : null;
        });
    }
  }

  ngOnDestroy(): void {
  }

  getOptionText(option: User) {
    if (!option) return '';
    return option.firstName ? option.firstName + ' ' + option.lastName : option.username
  }

  removeLoggedInUser(users: User[]) {
    return users.filter(u => u._id != this.helperService.getProfile()?.id)
  }

  generateQuery(query: string): string {
    if (query === 'default') {
      return `?sort={"firstName":1}`
        + `&skip=${(this.currentPage - 1) * this.pageSize}`
        + `&limit=${this.pageSize}`;
    }

    return `?query={"searchTerm":"${query}"}`
      + `&sort={"username":1}`
      + `&skip=${(this.currentPage - 1) * this.pageSize}`
      + `&limit=${this.pageSize}`;
  }

  handleUserSelection() {
    if (!this.createContactForm) return;

    let oldValue = this.createContactForm.value;
    let newValue = this.createContactForm.controls['appUserId'].value;
    let foundDifference = false;
    let foundValue=false;
    this.fields.forEach(f => {
      if (oldValue[f]) foundValue=true;
      if (oldValue[f] && oldValue[f] != newValue[f]) foundDifference = true;
    })
    if (foundDifference) {
      const dialogRef = this.dialog.open(OptionDialogComponent, {
        data: this.overwriteOperations
      });

      dialogRef.afterClosed().subscribe((option?: OptionalDialogDataOption) => {
        if (!option) return;
        else this.evaluateOverwriteOption(option, oldValue, newValue);
      });
    } else if (!foundValue) {
      const overOpt = this.overwriteOperations.options.find(o => o.key === 'over')
      overOpt ? this.evaluateOverwriteOption(overOpt, oldValue, newValue) : null;
    }
  }

  evaluateOverwriteOption(option: OptionalDialogDataOption, oldValue: any, newValue: any) {
    switch (option.key) {
      case 'keep': break;
      case 'over':
        this.fields.forEach((f: string) => oldValue[f] = newValue[f]);
        break;
      case 'update':
        this.fields.forEach((f: string) => oldValue[f] = oldValue[f] ? oldValue[f] : newValue[f])
        break;
    }
    this.createContactForm?.patchValue(oldValue);
  }

  get title(): AbstractControl | null | undefined {
    return this.createContactForm?.get('title');
  }

  get firstName(): AbstractControl | null | undefined {
    return this.createContactForm?.get('firstName');
  }

  get lastName(): AbstractControl | null | undefined {
    return this.createContactForm?.get('lastName');
  }

  get type(): AbstractControl | null | undefined {
    return this.createContactForm?.get('type');
  }

  get contact1(): AbstractControl | null | undefined {
    return this.createContactForm?.get('contact1');
  }

  get contact2(): AbstractControl | null | undefined {
    return this.createContactForm?.get('contact2');
  }

  get address(): AbstractControl | null | undefined {
    return this.createContactForm?.get('address');
  }
}
