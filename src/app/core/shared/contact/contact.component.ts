import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Contact } from '../../models/contact.model';
import { ContactService } from '../../services/contact.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

interface IAction {
  maticon: string,
  action: string,
  display: string,
  isDelete: boolean
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  @Input('contact') contact: Contact | undefined;
  @Output('deleted') deletedEvent = new EventEmitter<boolean>();

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

  constructor(private router: Router, public dialog: MatDialog, private contactService: ContactService) { }

  onActionClick(a: IAction) {
    switch (a.action) {
      case 'edit': this.editClick(); break;
      case 'delete': this.deleteClick(); break;
    }
  }

  editClick() {
    if (!this.contact) return;
    this.router.navigate(['contact/edit', this.contact._id]);
  }

  deleteClick() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (!this.contact) return;
      if (result) {
        this.contactService
          .deleteContact(this.contact._id)
          .subscribe(res => {
            if (res.data) {
              this.deletedEvent.emit();
            }
            else console.log('Error while deleting')
          })
      }
    });
  }
}
