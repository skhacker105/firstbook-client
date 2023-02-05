import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatRoomUsers } from '../../models/chat.model';
import { ConfirmationDialogData } from '../../models/confirmation-dialog.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {

  @Input() chatRoom: ChatRoomUsers | undefined;
  @Output() deleteClick = new EventEmitter<string>();
  @Output() undeleteClick = new EventEmitter<string>();

  name: string | undefined;
  actionDrawerOpen = false;

  constructor(private matDialog: MatDialog){}

  ngOnInit(): void {
    if (!this.chatRoom) return;
    this.name = this.chatRoom.shares.length === 1 ? this.chatRoom.shares[0].user?.firstName ? this.chatRoom.shares[0].user?.firstName :
      this.chatRoom.shares[0].user?.username : this.chatRoom.name
  }

  handleDeleteClick() {
    const data: ConfirmationDialogData = {
      message: 'It will be deleted temporarily. Are you sure you want to delete?',
      okDisplay: 'Disable',
      cancelDisplay: 'Cancel'
    };
    const ref = this.matDialog.open(ConfirmationDialogComponent, { data: data });
    
    ref.afterClosed().subscribe(result => {
      if (!this.chatRoom || !result) return;
      this.deleteClick.emit(this.chatRoom.id);
    });
  }

  handleUnDeleteClick() {
    const data: ConfirmationDialogData = {
      message: 'Are you sure to rejoin chat room?',
      okDisplay: 'Rejoin',
      cancelDisplay: 'Cancel'
    };
    const ref = this.matDialog.open(ConfirmationDialogComponent, { data: data });
    
    ref.afterClosed().subscribe(result => {
      if (!this.chatRoom || !result) return;
      this.undeleteClick.emit(this.chatRoom.id);
    });
  }
}
