import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';
import { Contact } from '../../models/contact.model';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-search',
  templateUrl: './contact-search.component.html',
  styleUrls: ['./contact-search.component.css']
})
export class ContactSearchComponent implements OnInit {

  pageSize = 500;
  currentPage = 1;
  contactChangeSub$: Observable<Contact[]> | undefined;
  contact: FormControl = new FormControl<Contact | undefined>(undefined);

  constructor(
    private contactService: ContactService,
    private dialogRef: MatDialogRef<ContactSearchComponent>) { }

  ngOnInit(): void {
    this.addUserChangeSubscription();
  }

  addUserChangeSubscription() {
    this.contactChangeSub$ = this.contact.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      filter(txt => !!txt),
      switchMap(txt => {
        return this.contactService.search(this.generateQuery(txt)).pipe(
          map(res => res.data ? res.data : [])
        );
      })
    );
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

  getOptionText(option: Contact) {
    if (!option) return '';
    return option.firstName + ' ' + option.lastName;
  }

  handleUserSelection() {
    this.dialogRef.close(this.contact.value);
  }
}
