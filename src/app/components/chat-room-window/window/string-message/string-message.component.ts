import { Component, Input, OnInit } from '@angular/core';
import { ChatMessage } from 'src/app/core/models/chat.model';

@Component({
  selector: 'app-string-message',
  templateUrl: './string-message.component.html',
  styleUrls: ['./string-message.component.css']
})
export class StringMessageComponent implements OnInit {

  @Input() message: ChatMessage | undefined;

  ngOnInit(): void {
  }
}
