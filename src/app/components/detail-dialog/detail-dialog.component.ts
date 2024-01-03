import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { CompleteEmployee } from '../../entities/employee.entity';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmAttendantDialogComponent } from '../confirmAttendantDialog/confirmAttendantDialog.component';

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './detail-dialog.component.html',
  styleUrls: ['./detail-dialog.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    MatTabsModule,
    MatButtonModule,
  ],
})
export class DetailDialogComponent implements OnInit {
  employee: CompleteEmployee;

  constructor(
    public dialogRef: MatDialogRef<DetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {
    this.employee = data.employee;
    console.log(this.employee);
  }

  ngOnInit() {}

  showConfirmAttendandDialog() {
    this.dialog.open(ConfirmAttendantDialogComponent, {
      data: { employee: this.employee },
    });
  }
}
