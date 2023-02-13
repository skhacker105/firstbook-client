import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent {
  @Input() isMe = false;
  @Input() isReplyOf = false;
  @Input() hideReplyAction = false;
  @Input() isDeleted = false;
  @Output() selectForReply = new EventEmitter<void>();
  @Output() doNotUserForReply = new EventEmitter<void>();
  @Output() deleteMessage = new EventEmitter<void>();
}
