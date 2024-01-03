import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { CompleteEmployee, WorkedDays } from '../../entities/employee.entity';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmAttendantDialogComponent } from '../confirmAttendantDialog/confirmAttendantDialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

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
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatMenuModule,
  ],
})
export class DetailDialogComponent implements OnInit {
  employee: CompleteEmployee;
  datesToFilter: { verbose: string; numeral: string }[] = [
    {
      verbose: 'Todas',
      numeral: '0',
    },
  ];
  workedDaysList: WorkedDays[] = [];
  selectedFilter: any;

  constructor(
    public dialogRef: MatDialogRef<DetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {
    this.employee = data.employee;
    this.workedDaysList = this.employee.workedDays;
  }

  ngOnInit() {
    this.getDatesToFilter();
  }

  filterChanged(event: any) {
    if (event.value.numeral === '0') {
      this.workedDaysList = this.employee.workedDays;
      return;
    }

    this.workedDaysList = this.employee.workedDays.filter((day) =>
      day.startDate.includes(event.value.numeral)
    );
  }

  showConfirmAttendandDialog() {
    this.dialog.open(ConfirmAttendantDialogComponent, {
      data: { employee: this.employee },
    });
  }

  getDatesToFilter() {
    this.employee.workedDays.map((day) => {
      const start = day.startDate.split('/');
      const initMonth = this.nameMonth(Number(start[1]));
      const initYear = start[2];
      this.datesToFilter.push({
        verbose: `${initMonth} ${initYear}`,
        numeral: `${start[1]}/${start[2]}`,
      });
    });
  }

  nameMonth(monthNumber: number): string {
    const allMonths = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return allMonths[monthNumber - 1];
  }
}
