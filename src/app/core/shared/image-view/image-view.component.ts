import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemImage } from '../../models/image';

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.css']
})
export class ImageViewComponent {

  constructor(
    public dialogRef: MatDialogRef<ImageViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ItemImage
  ){}
}
