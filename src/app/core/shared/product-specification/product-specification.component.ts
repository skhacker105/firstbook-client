import { Component, Input, OnInit } from '@angular/core';
import { DisplayFormat, ISpecs } from '../../models/specs';

@Component({
  selector: 'app-product-specification',
  templateUrl: './product-specification.component.html',
  styleUrls: ['./product-specification.component.css']
})
export class ProductSpecificationComponent implements OnInit {
  @Input() display: DisplayFormat = DisplayFormat.freeFlow
  @Input('category') specification: ISpecs | undefined;
  displayFormat = DisplayFormat;
  
  ngOnInit(): void {
  }
}
