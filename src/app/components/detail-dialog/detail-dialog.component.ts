import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  CompleteEmployee,
  EmployeeEntity,
  WorkedDays,
} from '../../entities/employee.entity';
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
import { SupabaseService } from '../../services/supabase.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule,
  ],
})
export class DetailDialogComponent implements OnInit {
  employeeCompleteName: string;
  employee: CompleteEmployee | undefined;
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
    private dialog: MatDialog,
    private readonly supabaseService: SupabaseService
  ) {
    this.employeeCompleteName = data.employeeCompleteName;
  }

  ngOnInit() {
    this.getEmployeeData();
  }

  getEmployeeData() {
    this.supabaseService
      .getEmployeeByCompleteName(this.employeeCompleteName)
      .then((employeeList) => {
        this.employee = this.transformData(employeeList as EmployeeEntity[]);
        this.getDatesToFilter();
      });
  }

  transformData = (originalData: EmployeeEntity[]): CompleteEmployee => {
    let completeEmployee: CompleteEmployee = {
      id: originalData[0].id!,
      completeName: originalData[0].complete_name!,
      phone: originalData[0].phone,
      totalHours: '0h 0m',
      workedDays: [],
    };

    originalData.forEach((originalEmployee) => {
      const workedHours = JSON.parse(originalEmployee.total_time);
      const totalWorkedHoursString = `${workedHours.hours}h ${workedHours.minutes}m`;

      const workedDay: WorkedDays = {
        startDate: originalEmployee.start_date,
        endDate: originalEmployee.end_date,
        workedHours: totalWorkedHoursString,
        signings: JSON.parse(originalEmployee.signings),
      };

      completeEmployee.workedDays.push(workedDay);
    });

    const workedDays = completeEmployee.workedDays;
    const totalWorkedHours = this.calculateTotalHours(
      workedDays.map((workedDay) => workedDay.workedHours)
    );

    completeEmployee.totalHours = `${totalWorkedHours.totalHoras} h ${totalWorkedHours.totalMinutos} m`;

    return completeEmployee;
  };

  calculateTotalHours(times: string[]) {
    let hours = 0;
    let minutes = 0;

    times.forEach((duration) => {
      const parts = duration.split(' ');
      if (parts.length === 2) {
        const hoursExtracted = parseInt(parts[0].replace('h', ''), 10);
        const minutesExtracted = parseInt(parts[1].replace('m', ''), 10);

        if (!isNaN(hoursExtracted) && !isNaN(minutesExtracted)) {
          hours += hoursExtracted;
          minutes += minutesExtracted;
        }
      }
    });

    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;

    return { totalHoras: hours, totalMinutos: minutes };
  }

  filterChanged(event: any) {
    if (event.value.numeral === '0') {
      this.workedDaysList = this.employee!.workedDays;
      return;
    }

    this.workedDaysList = this.employee!.workedDays.filter((day) =>
      day.startDate.includes(event.value.numeral)
    );
  }

  showConfirmAttendandDialog() {
    this.dialog
      .open(ConfirmAttendantDialogComponent, {
        data: { employee: this.employee },
      })
      .afterClosed()
      .subscribe((res) => {
        this.getEmployeeData();
      });
  }

  getDatesToFilter() {
    this.employee!.workedDays.map((day) => {
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
