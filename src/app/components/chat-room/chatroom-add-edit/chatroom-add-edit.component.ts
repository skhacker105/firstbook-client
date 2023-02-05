import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, filter, forkJoin, map, Observable, switchMap } from 'rxjs';
import { ChatRoom, ChatRoomUsers } from 'src/app/core/models/chat.model';
import { ServerResponse } from 'src/app/core/models/server-response.model';
import { User } from 'src/app/core/models/user.model';
import { ChatRoomService } from 'src/app/core/services/chat-room.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-chatroom-add-edit',
  templateUrl: './chatroom-add-edit.component.html',
  styleUrls: ['./chatroom-add-edit.component.css']
})
export class ChatroomAddEditComponent implements OnInit {

  id: string | undefined | null;
  chatRoomCreateForm: FormGroup | undefined;
  userChangeSub$: Observable<User[]> | undefined;
  pageSize = 500;
  currentPage = 1;
  selectedUsers: ChatRoomUsers | undefined;
  originalUsers: ChatRoomUsers | undefined;
  userEntry = false;

  constructor(
    private chatRoomService: ChatRoomService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private helperService: HelperService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('roomId');
    this.initCreateForm();
    this.loadChatRoom();
  }

  loadChatRoom() {
    if (!this.id) return;

    this.chatRoomService.getSingle(this.id)
      .subscribe(roomRes => {
        if (!roomRes.data || !this.chatRoomCreateForm) return;

        roomRes.data.user = undefined;
        this.chatRoomCreateForm.patchValue(roomRes.data);
        this.loadChatRoomUsers(roomRes.data)
      });
  }

  loadChatRoomUsers(room: ChatRoom) {
    this.chatRoomService.getAllChatRoomUsers(room)
      .subscribe(chatRoomUsers => {
        this.selectedUsers = chatRoomUsers;
        this.originalUsers = JSON.parse(JSON.stringify(this.selectedUsers));
      });
  }

  initCreateForm() {
    this.chatRoomCreateForm = this.fb.group({
      roomKey: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      user: new FormControl<User | undefined>(undefined)
    });
    this.addUserChangeSubscription(this.chatRoomCreateForm);
  }

  addUserChangeSubscription(form: FormGroup) {
    this.userChangeSub$ = form.get('user')!.valueChanges.pipe(
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

  handleUserSelection() {
    if (!this.chatRoomCreateForm) return;
    const selectedUser = this.chatRoomCreateForm.controls['user'].value as User;
    this.chatRoomCreateForm.controls['user'].setValue(undefined);
    if (!selectedUser || this.selectedUsers?.shares.find(u => u._id === selectedUser._id)) return;
    this.selectedUsers?.shares.push({
      _id: '',
      roomKey: this.chatRoomCreateForm.controls['roomKey'].value,
      name: this.chatRoomCreateForm.controls['name'].value,
      user: selectedUser
    });
    this.generateName(this.chatRoomCreateForm);
    this.generateKey(this.chatRoomCreateForm);
  }

  generateName(form: FormGroup) {
    if (this.id || (form.controls['name'].value && this.userEntry)) return;
    form.controls['name'].setValue(
      this.helperService.getProfile()?.username + '_' +
      this.selectedUsers?.shares.reduce((s, v) => s = s + (s ? '_' : '') + v.user?.username, '')
    );
  }

  generateKey(form: FormGroup) {
    if (this.id) return;
    let key = this.helperService.getProfile()?._id + '_' + this.selectedUsers?.shares.reduce((s, v) => s = s + (s ? '_' : '') + v.user?._id, '');
    key = this.helperService.hashFnv32a(key);
    form.controls['roomKey'].setValue(key);
  }

  removeSelectedUser(share: ChatRoom) {
    if (!this.chatRoomCreateForm || !this.selectedUsers) return;
    this.selectedUsers.shares = this.selectedUsers?.shares.filter(u => u._id != share._id);
    this.generateName(this.chatRoomCreateForm);
    this.generateKey(this.chatRoomCreateForm);
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

  onSubmit() {
    if (!this.chatRoomCreateForm) return;
    if (this.selectedUsers?.shares.length === 0) return this.toastr.error('Select at least one user.')
    if (this.chatRoomCreateForm.invalid) return this.toastr.error('Invalid form');

    const roomKey = this.chatRoomCreateForm.controls['roomKey'].value;
    const name = this.chatRoomCreateForm.controls['name'].value;
    const obs = this.generateUsersOperations(roomKey, name);

    if (obs.length > 0)
      forkJoin(obs)
        .subscribe((chatrooms: ServerResponse<ChatRoom>[]) => {
          this.loadChatRoom();
        });
    return;
  }

  generateUsersOperations(roomKey: string, name: string): Observable<ServerResponse<ChatRoom>>[] {
    if (!this.chatRoomCreateForm) return [];
    const profile = this.helperService.getProfile() as User;
    let newShares = this.selectedUsers?.shares.filter(u => !u._id);
    let deletedShares = this.originalUsers?.shares.filter(ou => !this.selectedUsers?.shares.some(u => ou._id === u._id));
    if (!newShares) newShares = [];
    if (!deletedShares) deletedShares = [];

    let result: Observable<ServerResponse<ChatRoom>>[] = [];
    result = result.concat(newShares.map(room => {
      return this.chatRoomService.addChatRoom({ roomKey, name, user: room.user?._id });
    }));
    if (this.id)
    result.push(this.chatRoomService.editChatRoom(this.id, { name }));
    result = result.concat(deletedShares.map(room => {
      return this.chatRoomService.deleteChatRoom(room._id);
    }));
    return result;
  }

}
