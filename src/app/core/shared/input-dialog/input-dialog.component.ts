import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IInputDialogConfig } from '../../models/input-dialog-config';

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.css']
})
export class InputDialogComponent implements OnInit {

  input: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: IInputDialogConfig) { }
  
  ngOnInit(): void {
    this.input = this.data.initialValue ? this.data.initialValue : '';
  }
}
