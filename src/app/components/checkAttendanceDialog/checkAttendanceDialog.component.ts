import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Employee } from '../../entities/employee';

@Component({
  selector: 'app-checkAttendanceDialog',
  templateUrl: './checkAttendanceDialog.component.html',
  styleUrls: ['./checkAttendanceDialog.component.css'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    TextFieldModule,
  ],
})
export class CheckAttendanceDialogComponent implements OnInit {
  noAttendant: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<CheckAttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  check(employeesToCheck: string) {
    const employeeList = employeesToCheck.split('\n');
    const employees = this.data.employees.map(
      (employee: Employee) => employee.completeName
    );

    this.noAttendant = employeeList.filter(
      (employee) => !employees.includes(employee)
    );
  }
}
