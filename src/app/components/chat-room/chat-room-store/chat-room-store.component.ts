import { Component, OnInit } from '@angular/core';
import { forkJoin, mergeMap, Observable, of } from 'rxjs';
import { AddEntity } from 'src/app/core/models/add-entity.model';
import { ChatRoomUsers } from 'src/app/core/models/chat.model';
import { ChatRoomService } from 'src/app/core/services/chat-room.service';

@Component({
  selector: 'app-chat-room-store',
  templateUrl: './chat-room-store.component.html',
  styleUrls: ['./chat-room-store.component.css']
})
export class ChatRoomStoreComponent implements OnInit {

  addEntity: AddEntity = { url: '/chatroom/create' };
  chatrooms: ChatRoomUsers[] = [];

  constructor(
    private chatRoomService: ChatRoomService
  ) { }

  ngOnInit(): void {
    this.loadChatRoomWithUsers();
  }

  loadChatRoomWithUsers() {
    this.chatRoomService.getAllChatRooms()
      .pipe(mergeMap(roomsRes => {
        let obc: Observable<ChatRoomUsers>[] | undefined = roomsRes.data?.map(room => this.chatRoomService.getAllChatRoomUsers(room));
        return obc ? forkJoin(obc) : of([]);
      }))
      .subscribe(rooms => {
        this.chatrooms = rooms;
      });
  }

  handleDeleteChatRoom(room: ChatRoomUsers) {
    this.chatRoomService.deleteChatRoom(room.id)
    .subscribe(res => {
      this.loadChatRoomWithUsers();
    })
  }

  handleUnDeleteChatRoom(room: ChatRoomUsers) {
    this.chatRoomService.undeleteChatRoom(room.id)
    .subscribe(res => {
      this.loadChatRoomWithUsers();
    })
  }
}
