// Decorators and Lifehooks
import { Component, OnDestroy, OnInit } from '@angular/core';

// Services
import { UserService } from '../../../core/services/user.service';

// Models
import { Receipt } from '../../../core/models/receipt.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.css']
})
export class ReceiptsComponent implements OnInit, OnDestroy {
  receipts: Receipt[] = [];
  isComponentIsActive = new Subject();

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService
      .getPurchaseHistory()
      .pipe(takeUntil(this.isComponentIsActive)).subscribe((res) => {
        this.receipts = res.data ? res.data : [];
      });
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete()
  }

}
