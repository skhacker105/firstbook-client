import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-timer-count-down',
  templateUrl: './timer-count-down.component.html',
  styleUrls: ['./timer-count-down.component.css']
})
export class TimerCountDownComponent {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: number, public snackBarRef: MatSnackBarRef<TimerCountDownComponent> ) { }
}
