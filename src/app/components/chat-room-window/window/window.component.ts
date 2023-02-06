import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatRoom, ChatRoomUsers } from 'src/app/core/models/chat.model';
import { User } from 'src/app/core/models/user.model';
import { ChatRoomService } from 'src/app/core/services/chat-room.service';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css']
})
export class WindowComponent implements OnInit, OnDestroy {

  id: string | undefined | null;
  room: ChatRoom | undefined;
  name: string | undefined;
  loginProfile: User | undefined;
  selectedUsers: ChatRoomUsers | undefined;
  roomUserNames: string = '';
  messageForm: FormGroup | undefined;
  scrollMe: HTMLElement | null | undefined;

  constructor(
    private route: ActivatedRoute,
    private chatRoomService: ChatRoomService,
    private helperService: HelperService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('roomId');
    this.loginProfile = this.helperService.getProfile();
    this.loadChatRoom();
    this.initMessageForm();
    this.helperService.showGlobalSearch = false;
    this.helperService.showFooter = false;
    setTimeout(() => {
      this.scrollMe = document.getElementById('scrollme');
      console.log('this.scrollme = ', this.scrollMe)
      this.scrollToBottom();
    }, 1000)
  }

  ngOnDestroy(): void {
    this.helperService.showGlobalSearch = true;
    this.helperService.showFooter = true;
  }

  initMessageForm() {
    this.messageForm = this.fb.group({
      message: new FormControl('', Validators.required)
    });
  }

  loadChatRoom() {
    if (!this.id) return;

    this.chatRoomService.getSingle(this.id)
      .subscribe(roomRes => {
        if (!roomRes.data || !this.loginProfile) return;
        roomRes.data.user = this.loginProfile;
        this.room = roomRes.data;
        this.loadChatRoomUsers(roomRes.data);

      });
  }

  loadChatRoomUsers(room: ChatRoom) {
    this.chatRoomService.getAllChatRoomUsers(room)
      .subscribe(chatRoomUsers => {
        this.selectedUsers = chatRoomUsers;
        this.selectedUsers.profile = this.loginProfile;
        this.name = this.getRoomName(this.selectedUsers);
        this.roomUserNames = this.accumulateUserNames(this.selectedUsers);
      });
  }

  accumulateUserNames(roomUsers: ChatRoomUsers): string {
    if (roomUsers.shares.length === 1) return '';
    let name = '';
    roomUsers.shares.forEach(room => {
      name = name + (name ? ', ' : '') + this.getUserName(room);
    });
    return name;
  }

  getUserName(chatRoom: ChatRoom): string | undefined {
    return chatRoom.user?.firstName ? chatRoom.user.firstName : chatRoom.user?.username;
  }

  getRoomName(roomUsers: ChatRoomUsers): string | undefined {
    return roomUsers.shares.length === 1 ?
      roomUsers.shares[0].user?.firstName ?
        roomUsers.shares[0].user?.firstName :
        roomUsers.shares[0].user?.username :
      roomUsers.name
  }

  scrollToBottom(): void {
    if (!this.scrollMe) return;
    this.scrollMe.scrollIntoView({ behavior: 'smooth' });
    console.log('scrolled')
  }

}
