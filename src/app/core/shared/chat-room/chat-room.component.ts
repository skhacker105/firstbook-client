import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ChatRoomUsers } from '../../models/chat.model';
import { ConfirmationDialogData } from '../../models/confirmation-dialog.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {

  @Input() chatRoom: ChatRoomUsers | undefined;
  @Output() deleteClick = new EventEmitter<string>();
  @Output() undeleteClick = new EventEmitter<string>();

  name: string | undefined;
  actionDrawerOpen = false;
  isComponentIsActive = new Subject();

  constructor(private matDialog: MatDialog, private router: Router){}

  ngOnInit(): void {
    if (!this.chatRoom) return;
    this.name = this.chatRoom.shares.length === 1 ? this.chatRoom.shares[0].user?.firstName ? this.chatRoom.shares[0].user?.firstName :
      this.chatRoom.shares[0].user?.username : this.chatRoom.name
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  handleDeleteClick() {
    const data: ConfirmationDialogData = {
      message: 'It will be deleted temporarily. Are you sure you want to delete?',
      okDisplay: 'Disable',
      cancelDisplay: 'Cancel'
    };
    const ref = this.matDialog.open(ConfirmationDialogComponent, { data: data });
    
    ref.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe(result => {
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
    
    ref.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe(result => {
      if (!this.chatRoom || !result) return;
      this.undeleteClick.emit(this.chatRoom.id);
    });
  }

  gotoRoomWindow() {
    if (!this.chatRoom) return;
    this.router.navigateByUrl(`/chatroomwindow/default/${this.chatRoom.id}`);
  }
}
