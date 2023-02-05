// Decorators
import { Component, OnInit } from '@angular/core';
import { AddEntity } from './core/models/add-entity.model';
import { HelperService } from './core/services/helper.service';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  addEntity: AddEntity | undefined
  constructor(private helperService: HelperService,
    private userService: UserService) { }

  ngOnInit(): void {
    if (this.helperService.isLoggedIn() && !this.userService.userProductsLoaded) {
      let profile = this.helperService.getProfile();
      if (profile)
        this.userService.loadUserProducts(profile);
    }
  }
}
