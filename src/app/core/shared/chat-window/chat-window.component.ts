import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent {
  @Input() isMe = false;
  @Output() selectForReply = new EventEmitter<void>();
}
