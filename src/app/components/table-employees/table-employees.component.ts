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
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatTooltipModule,
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
  searchForm: FormGroup;

  displayedColumns: string[] = [
    'completeName',
    'phone',
    'workedDays',
    'totalHours',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  employees: CompleteEmployee[] = [];

  sortedEmployees: CompleteEmployee[] = [];

  dataSource: MatTableDataSource<CompleteEmployee> =
    new MatTableDataSource<CompleteEmployee>();

  expandedElement: Employee | undefined;

  gettingData: boolean = false;

  constructor(
    readonly employeeService: EmployeesService,
    private readonly supabaseService: SupabaseService,
    private readonly dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required],
    });
  }

  ngOnInit() {}

  findEmployees() {
    if (this.searchForm.invalid) {
      return;
    }
    this.gettingData = true;
    const month = this.searchForm.get('month')?.value;
    const year = this.searchForm.get('year')?.value;
    this.supabaseService.getEmployees(month, year).then((data) => {
      this.sortedEmployees = this.transformData(data as EmployeeEntity[]);
      this.employees = this.sortedEmployees;
      this.dataSource.data = this.employees;
      this.gettingData = false;
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
          phone: originalEmployee.phone,
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

      employee.totalHours = `${totalWorkedHours.totalHoras} h ${totalWorkedHours.totalMinutos} m`;
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
        case 'workedDays':
          return this.compare(a.workedDays.length, b.workedDays.length, isAsc);
        case 'totalHours':
          const formatTime = (time: any) => {
            const matches = time.match(/\d+/g);
            const hours = matches[0].toString().padStart(2, '0');
            const minutes = matches[1].toString().padStart(2, '0');
            return hours + ':' + minutes;
          };
          return this.compare(
            formatTime(a.totalHours),
            formatTime(b.totalHours),
            isAsc
          );
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
      width: '90%',
      height: '80vh',
      data: { employeeCompleteName: employee.completeName },
    });
  }

  months(): { index: string; name: string }[] {
    const allMonths = [
      { index: '01', name: 'Enero' },
      { index: '22', name: 'Febrero' },
      { index: '03', name: 'Marzo' },
      { index: '04', name: 'Abril' },
      { index: '05', name: 'Mayo' },
      { index: '06', name: 'Junio' },
      { index: '07', name: 'Julio' },
      { index: '08', name: 'Agosto' },
      { index: '09', name: 'Septiembre' },
      { index: '10', name: 'Octubre' },
      { index: '11', name: 'Noviembre' },
      { index: '12', name: 'Diciembre' },
    ];
    return allMonths;
  }
}
