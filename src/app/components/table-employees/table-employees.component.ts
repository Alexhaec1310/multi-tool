import { EmployeeEntity } from './../../entities/employee.entity';
import { Employee } from '../../entities/employee';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EmployeesService } from '../../services/employees.service';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TableUtil } from '../../utils/table-utils';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatSortModule } from '@angular/material/sort';
import { SupabaseService } from '../../services/supabase.service';
import { CompleteEmployee, WorkedDays } from '../../entities/employee.entity';
import { DetailDialogComponent } from '../detail-dialog/detail-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-table-employees',
  templateUrl: './table-employees.component.html',
  styleUrls: ['./table-employees.component.css'],
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class TableEmployeesComponent implements OnInit {
  displayedColumns: string[] = ['completeName', 'workedDays', 'totalHours'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  employees: CompleteEmployee[] = [];

  sortedEmployees: CompleteEmployee[] = [];

  dataSource: MatTableDataSource<CompleteEmployee> =
    new MatTableDataSource<CompleteEmployee>();

  expandedElement: Employee | undefined;

  constructor(
    readonly employeeService: EmployeesService,
    private readonly supabaseService: SupabaseService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit() {
    this.supabaseService.getEmployees().then(({ data }) => {
      this.sortedEmployees = this.transformData(data as EmployeeEntity[]);
      this.employees = this.sortedEmployees;
      this.dataSource.data = this.employees;
    });
  }

  transformData = (originalData: EmployeeEntity[]): CompleteEmployee[] => {
    const groupedData: Record<string, CompleteEmployee> = {};

    originalData.forEach((originalEmployee) => {
      const completeName = originalEmployee.complete_name!;
      if (!groupedData[completeName]) {
        groupedData[completeName] = {
          id: originalEmployee.id!,
          completeName: completeName,
          totalHours: '0h 0m',
          workedDays: [],
        };
      }

      const workedHours = JSON.parse(originalEmployee.total_time);
      const totalWorkedHoursString = `${workedHours.hours}h ${workedHours.minutes}m`;

      const workedDay: WorkedDays = {
        startDate: originalEmployee.start_date,
        endDate: originalEmployee.end_date,
        workedHours: totalWorkedHoursString,
        signings: JSON.parse(originalEmployee.signings),
      };

      groupedData[completeName].workedDays.push(workedDay);
    });

    const employeesConverted = Object.values(groupedData);

    employeesConverted.forEach((employee) => {
      const workedDays = employee.workedDays;
      const totalWorkedHours = this.calculateTotalHours(
        workedDays.map((workedDay) => workedDay.workedHours)
      );

      employee.totalHours = `${totalWorkedHours.totalHoras}h ${totalWorkedHours.totalMinutos}m`;
    });

    return Object.values(groupedData);
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  exportTable() {
    TableUtil.exportTableToExcel('employeesTable', new Date().toISOString());
  }

  sortData(sort: any) {
    const data = this.employees.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedEmployees = data;
      return;
    }

    this.sortedEmployees = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'completeName':
          return this.compare(a.completeName, b.completeName, isAsc);
        default:
          return 0;
      }
    });

    this.dataSource.data = this.sortedEmployees;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  showDetail(employee: CompleteEmployee) {
    this.dialog.open(DetailDialogComponent, {
      width: '50vw',
      height: '70vh',
      data: { employee },
    });
  }
}
