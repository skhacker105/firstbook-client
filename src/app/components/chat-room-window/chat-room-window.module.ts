import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoomWindowRoutingModule } from './chat-room-window-routing.module';
import { WindowComponent } from './window/window.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/core/shared/shared.module';
import { StringMessageComponent } from './window/string-message/string-message.component';


@NgModule({
  declarations: [
    WindowComponent,
    StringMessageComponent
  ],
  imports: [
    CommonModule,
    ChatRoomWindowRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class ChatRoomWindowModule { }
