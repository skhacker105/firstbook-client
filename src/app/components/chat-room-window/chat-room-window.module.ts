import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoomWindowRoutingModule } from './chat-room-window-routing.module';
import { WindowComponent } from './window/window.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/core/shared/shared.module';


@NgModule({
  declarations: [
    WindowComponent
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
