// Decorators
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddEntity } from './core/models/add-entity.model';
import { HelperService } from './core/services/helper.service';
import { UserService } from './core/services/user.service';
import { LoaderComponent } from './core/shared/loader/loader.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  addEntity: AddEntity | undefined
  constructor(
    private helperService: HelperService,
    private userService: UserService,
    private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    if (this.helperService.isLoggedIn() && !this.userService.userProductsLoaded) {
      let profile = this.helperService.getProfile();
      if (profile)
        this.userService.loadUserProducts(profile);
    }
    this.handleHttpCallCounterChange();
  }

  handleHttpCallCounterChange() {
    let ref: MatDialogRef<LoaderComponent> | undefined
    this.helperService.pendingHttpCall.subscribe(pending => {
      if (pending && !ref) {
        ref = this.matDialog.open(LoaderComponent);
      }
      else if (!pending && ref) {
        ref.close();
      }
    });
  }
}
