import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoomRoutingModule } from './chat-room-routing.module';
import { ChatRoomStoreComponent } from './chat-room-store/chat-room-store.component';
import { ChatroomAddEditComponent } from './chatroom-add-edit/chatroom-add-edit.component';
import { ChatroomDetailsComponent } from './chatroom-details/chatroom-details.component';
import { ChatRoomWindowComponent } from './chat-room-window/chat-room-window.component';
import { SharedModule } from 'src/app/core/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ChatRoomStoreComponent,
    ChatroomAddEditComponent,
    ChatroomDetailsComponent,
    ChatRoomWindowComponent
  ],
  imports: [
    CommonModule,
    ChatRoomRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class ChatRoomModule { }
