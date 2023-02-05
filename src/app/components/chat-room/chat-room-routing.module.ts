import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsAuthenticatedGuard } from 'src/app/core/guards/is-authenticated.guard';
import { ChatRoomStoreComponent } from './chat-room-store/chat-room-store.component';
import { ChatRoomWindowComponent } from './chat-room-window/chat-room-window.component';
import { ChatroomAddEditComponent } from './chatroom-add-edit/chatroom-add-edit.component';
import { ChatroomDetailsComponent } from './chatroom-details/chatroom-details.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'allRooms',
    pathMatch: 'full'
  },
  {
    path: 'allRooms',
    canActivate: [IsAuthenticatedGuard],
    component: ChatRoomStoreComponent
  },
  {
    path: 'create',
    canActivate: [IsAuthenticatedGuard],
    component: ChatroomAddEditComponent
  },
  {
    path: 'edit/:roomId',
    canActivate: [IsAuthenticatedGuard],
    component: ChatroomAddEditComponent
  },
  {
    path: 'detail/:roomId',
    canActivate: [IsAuthenticatedGuard],
    component: ChatroomDetailsComponent
  },
  {
    path: 'window',
    canActivate: [IsAuthenticatedGuard],
    component: ChatRoomWindowComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoomRoutingModule { }
