import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Contact } from '../../models/contact.model';
import { IInputDialogConfig } from '../../models/input-dialog-config';
import { ChatRoomService } from '../../services/chat-room.service';
import { ContactService } from '../../services/contact.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { InputDialogComponent } from '../input-dialog/input-dialog.component';

interface IAction {
  maticon: string,
  action: string,
  display: string,
  isDelete: boolean,
  disabled?: boolean
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit, OnDestroy {
  @Input('contact') contact: Contact | undefined;
  @Output('deleted') deletedEvent = new EventEmitter<boolean>();
  isComponentIsActive = new Subject();

  actions: IAction[] = [
    {
      maticon: 'edit',
      action: 'edit',
      display: 'Edit',
      isDelete: false
    },
    {
      maticon: 'chat',
      action: 'chat',
      display: 'Chat',
      isDelete: false
    },
    {
      maticon: 'note_add',
      action: 'notes',
      display: 'Notes',
      isDelete: false
    },
    {
      maticon: 'delete_forever',
      action: 'delete',
      display: 'Delete',
      isDelete: true
    }
  ];

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private contactService: ContactService,
    private chatRoomService: ChatRoomService
  ) { }

  ngOnInit(): void {
    const chatAction = this.actions.find(a => a.action === 'chat');
    if (!this.contact?.appUserId && chatAction) chatAction.disabled = true;
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

  onActionClick(a: IAction) {
    switch (a.action) {
      case 'edit': this.editClick(); break;
      case 'delete': this.deleteClick(); break;
      case 'notes': this.notesClick(); break;
      case 'chat': this.chatClick(); break;
    }
  }

  editClick() {
    if (!this.contact) return;
    this.router.navigate(['contact/edit', this.contact._id]);
  }

  deleteClick() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().pipe(takeUntil(this.isComponentIsActive)).subscribe((result: boolean) => {
      if (!this.contact) return;
      if (result) {
        this.contactService
          .deleteContact(this.contact._id)
          .pipe(takeUntil(this.isComponentIsActive)).subscribe(res => {
            if (res.data) {
              this.deletedEvent.emit();
            }
            else console.log('Error while deleting')
          })
      }
    });
  }

  notesClick() {
    if (!this.contact) return;
    const notesPopupDataConfig: IInputDialogConfig = {
      initialValue: this.contact.notes,
      multiLine: true,
      inputLabel: 'NOTES',
      placeHolder: 'This will only be visible to you',
      title: 'Notes for ' + this.contact?.firstName
    }
    let notesPopupRef = this.dialog.open(InputDialogComponent, {
      data: notesPopupDataConfig
    });

    notesPopupRef.afterClosed().subscribe((result: string) => {
      if (!result || !this.contact) return;
      result = result.trim();
      if (!result) return;
      this.contactService.updateContactNotes(this.contact._id, { notes: result })
        .pipe(takeUntil(this.isComponentIsActive))
        .subscribe(updatedContact => {
          if (!this.contact) return;
          this.contact.notes = result;
        });
    })
  }

  chatClick() {
    if (!this.contact) return;
    this.chatRoomService.getUserChatRoom(this.contact.appUserId._id)
    .pipe(takeUntil(this.isComponentIsActive))
    .subscribe(roomRes => {
      if (roomRes.data) this.router.navigate(['/chatroomwindow/default/', roomRes.data._id]);
    })
  }
}
