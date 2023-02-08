import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ChatMessage, ChatRoom, ChatRoomUsers } from 'src/app/core/models/chat.model';
import { User } from 'src/app/core/models/user.model';
import { ChatRoomService } from 'src/app/core/services/chat-room.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { WebsocketService } from '../service/websocket.service';

enum RoomTypes {
  stringMessage = 'string'
}

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
  isTyping: boolean | undefined = false;
  messageArray: ChatMessage[] = [];
  pageSize = 15;
  currentPage = 1;
  isComponentIsActive = new Subject();

  constructor(
    private route: ActivatedRoute,
    private chatRoomService: ChatRoomService,
    private helperService: HelperService,
    private fb: FormBuilder,
    private webSocketService: WebsocketService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('roomId');
    if (!this.id) this.router.navigateByUrl('/chatroom');
    this.loginProfile = this.helperService.getProfile();
    this.initMessageForm();
    this.loadChatRoom();
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
    this.isComponentIsActive.complete()
  }

  initMessageForm(room?: ChatRoom) {
    this.messageForm = this.fb.group({
      roomKey: new FormControl(room?.roomKey, Validators.required),
      room: new FormControl(room?._id, Validators.required),
      message: new FormControl('', Validators.required),
      type: new FormControl(RoomTypes.stringMessage, Validators.required)
    });
  }

  loadChatRoom() {
    if (!this.id) return;

    this.chatRoomService.getSingle(this.id)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(roomRes => {
        if (!roomRes.data || !this.loginProfile) return;
        roomRes.data.user = this.loginProfile;
        this.room = roomRes.data;
        this.initMessageForm(roomRes.data);
        this.loadChatRoomUsers(roomRes.data);
        this.initiateSocketConnection(roomRes.data);
        this.loadChats(roomRes.data);
      });
  }

  loadChatRoomUsers(room: ChatRoom) {
    this.chatRoomService.getAllChatRoomUsers(room)
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(chatRoomUsers => {
        this.selectedUsers = chatRoomUsers;
        this.selectedUsers.profile = this.loginProfile;
        this.name = this.getRoomName(this.selectedUsers);
        this.roomUserNames = this.accumulateUserNames(this.selectedUsers);
      });
  }

  loadChats(room: ChatRoom) {
    console.log('room = ', room)
    this.chatRoomService.search(this.generateQuery(room.roomKey))
      .pipe(takeUntil(this.isComponentIsActive)).subscribe(messagesRes => {
        if (messagesRes.data) this.messageArray = messagesRes.data.reverse().concat(this.messageArray);
      })
  }

  generateQuery(query: string): string {
    return `?query={"searchTerm":"${query}"}`
      + `&sort={"creationDate":-1}`
      + `&skip=${(this.currentPage - 1) * this.pageSize}`
      + `&limit=${this.pageSize}`;
  }

  initiateSocketConnection(room: ChatRoom) {
    this.webSocketService.joinRoom(room.roomKey);
    this.webSocketService.newMessageReceived().pipe(takeUntil(this.isComponentIsActive)).subscribe(message => {
      this.messageArray.push(message);
      this.isTyping = false;
    });
    this.webSocketService.receivedTyping().pipe(takeUntil(this.isComponentIsActive)).subscribe(message => {
      console.log('isTyping = ', message.isTyping);
      this.isTyping = message.isTyping;
    });
  }

  sendMessage() {
    if (this.messageForm?.invalid) return;
    this.webSocketService.sendMessage(this.messageForm?.value);
    this.initMessageForm(this.room);
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
