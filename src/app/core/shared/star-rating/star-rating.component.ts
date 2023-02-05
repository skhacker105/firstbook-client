import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.css']
})
export class StarRatingComponent implements OnChanges {
  @Input() currentRating?= 0;
  @Input() ratingPoints?= 0;
  @Input() ratedCount?= 0;
  @Input() userId?: string | undefined | null;
  @Input() ratedBy?: string[] = [];
  @Output('rate') rateProduct = new EventEmitter<number>();
  alreadyRated = false;
  newRating: number = 0;

  ngOnChanges(): void {
    this.alreadyRated = this.checkIfAlreadyRated();
  }

  checkIfAlreadyRated(): boolean {
    return this.ratedBy?.find(r => r === this.userId) ? true : false;
  }

  handleRating(rating: number) {
    this.newRating = rating;
    this.rateProduct.emit(rating);
  }
}
