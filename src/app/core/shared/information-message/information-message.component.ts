import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-information-message',
  templateUrl: './information-message.component.html',
  styleUrls: ['./information-message.component.css']
})
export class InformationMessageComponent {
  @Input() message = 'No message';
}
