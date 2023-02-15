import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';
import { User } from '../../models/user.model';
import { HelperService } from '../../services/helper.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {

  pageSize = 500;
  currentPage = 1;
  userChangeSub$: Observable<User[]> | undefined;
  user: FormControl = new FormControl<User | undefined>(undefined);

  constructor(
    private userService: UserService,
    private helperService: HelperService,
    private dialogRef: MatDialogRef<UserSearchComponent>) { }

  ngOnInit(): void {
    this.addUserChangeSubscription();
  }

  addUserChangeSubscription() {
    this.userChangeSub$ = this.user.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      filter(txt => !!txt),
      switchMap(txt => {
        return this.userService.search(this.generateQuery(txt)).pipe(
          map(res => res.data ? this.removeLoggedInUser(res.data) : [])
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

  removeLoggedInUser(users: User[]) {
    return users.filter(u => u._id != this.helperService.getProfile()?.id)
  }

  getOptionText(option: User) {
    if (!option) return '';
    return option.firstName ? option.firstName + ' ' + option.lastName : option.username
  }

  handleUserSelection() {
    this.dialogRef.close(this.user.value);
  }
}
