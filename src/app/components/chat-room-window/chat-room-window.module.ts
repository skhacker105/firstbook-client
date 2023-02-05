import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoomWindowRoutingModule } from './chat-room-window-routing.module';
import { WindowComponent } from './window/window.component';


@NgModule({
  declarations: [
    WindowComponent
  ],
  imports: [
    CommonModule,
    ChatRoomWindowRoutingModule
  ]
})
export class ChatRoomWindowModule { }
