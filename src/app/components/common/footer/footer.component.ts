// Decorators
import { Component } from '@angular/core';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  constructor(public helperService: HelperService) {}
}
