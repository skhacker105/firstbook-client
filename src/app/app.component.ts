// Decorators
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AddEntity } from './core/models/add-entity.model';
import { HelperService } from './core/services/helper.service';
import { UserService } from './core/services/user.service';
import { LoaderComponent } from './core/shared/loader/loader.component';
import { TimerCountDownComponent } from './core/shared/timer-count-down/timer-count-down.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  addEntity: AddEntity | undefined
  alertRef: MatSnackBarRef<TimerCountDownComponent> | undefined;
  constructor(
    private helperService: HelperService,
    private userService: UserService,
    private matDialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    let profile = this.helperService.getProfile();
    if (profile) {
      this.helperService.statSessionWatch();
    }
    this.handleHttpCallCounterChange();
    this.handleSessionTrackerSubscription();
  }

  handleHttpCallCounterChange() {
    let ref: MatDialogRef<LoaderComponent> | undefined
    this.helperService.pendingHttpCall.subscribe(pending => {
      if (pending && !ref) {
        ref = this.matDialog.open(LoaderComponent, {
          panelClass: 'loader-dialog-panel'
        });
      }
      else if (!pending && ref) {
        ref.close();
        ref = undefined;
      }
    });
  }

  handleSessionTrackerSubscription() {
    let counterStarted = false;
    this.helperService.sessionTimeRemaining.subscribe(remaining => {
      if (remaining) {
        if (!this.alertRef && !counterStarted) {
          this.alertRef = this.snackbar.openFromComponent(TimerCountDownComponent, {
            data: remaining
          });
          counterStarted = true;
        }
        else if (this.alertRef) {
          this.alertRef.instance.data = remaining;
        }
      } else {
        if (counterStarted) {
          this.userService.logout();
          this.router.navigateByUrl('/');
        }
        this.alertRef?.dismiss();
        this.alertRef = undefined;
      }
    });

    this.helperService.isUserLogged.subscribe(isLoggedIn => {
      if (!isLoggedIn && this.alertRef) {
        counterStarted = false;
        this.alertRef.dismiss();
        this.alertRef = undefined;
      }
    })
  }
}
