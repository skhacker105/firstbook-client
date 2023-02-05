import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AddEntity } from '../../models/add-entity.model';

@Component({
  selector: 'app-add-entity-trigger',
  templateUrl: './add-entity-trigger.component.html',
  styleUrls: ['./add-entity-trigger.component.css']
})
export class AddEntityTriggerComponent {
  @Input() addEntity: AddEntity | undefined;

  constructor(private router: Router) {}

  rerouteToAddEntity() {
    if (this.addEntity)
      this.router.navigateByUrl(this.addEntity.url);
  }
}
