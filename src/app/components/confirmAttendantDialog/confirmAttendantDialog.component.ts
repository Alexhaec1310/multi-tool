import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CompleteEmployee } from '../../entities/employee.entity';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmAttendantDialog',
  templateUrl: './confirmAttendantDialog.component.html',
  styleUrls: ['./confirmAttendantDialog.component.css'],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
})
export class ConfirmAttendantDialogComponent implements OnInit {
  employee: CompleteEmployee;
  today = new Date().toLocaleDateString();
  constructor(
    public dialogRef: MatDialogRef<ConfirmAttendantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.employee = data.employee;
  }

  ngOnInit() {}
}
