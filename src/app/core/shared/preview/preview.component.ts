import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ItemImage } from '../../models/image';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {
  @Input() customOptions: OwlOptions | undefined;
  @Input() files: ItemImage[] = [];
  @Input() mainImage: ItemImage | undefined;
  @Input() showActions = true;
  @Output() deleteMainImage = new EventEmitter<any>();
  @Output() deleteImage = new EventEmitter<string>();
  @Output() setMainImage = new EventEmitter<string>();
  @Output() imageClick = new EventEmitter<{ image: ItemImage, isMain: boolean }>();


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
