import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subject, takeUntil } from 'rxjs';
import { ItemImage } from '../../models/image';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit, OnDestroy {
  @Input() customOptions: OwlOptions | undefined;
  @Input() files: ItemImage[] = [];
  @Input() mainImage: ItemImage | undefined;
  @Input() showActions = true;
  @Input() showLoadMore = false;
  @Output() deleteMainImage = new EventEmitter<any>();
  @Output() deleteImage = new EventEmitter<string>();
  @Output() setMainImage = new EventEmitter<string>();
  @Output() loadMoreImage = new EventEmitter<any>();
  @Output() imageClick = new EventEmitter<{ image: ItemImage, isMain: boolean }>();
  loadMoreText = 'Load More Images';
  isPrintTriggered = false;
  isComponentIsActive = new Subject<void>();

  constructor(private helperService: HelperService) { }

  ngOnInit(): void {
    this.helperService.printTriggered.pipe(takeUntil(this.isComponentIsActive)).subscribe(state => { this.isPrintTriggered = state });
  }

  ngOnDestroy(): void {
    this.isComponentIsActive.complete();
  }

  handleDeleteMainMenu() {
    this.deleteMainImage.emit();
  }

  handleDeleteImage(id: string) {
    this.deleteImage.emit(id);
  }

  handleSetMainImage(id: string) {
    this.setMainImage.emit(id);
  }

  handleImageClick(image: ItemImage, isMain: boolean) {
    this.imageClick.emit({ image, isMain });
  }
}
