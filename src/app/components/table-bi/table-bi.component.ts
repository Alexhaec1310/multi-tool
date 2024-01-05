import { Employee } from '../../entities/employee';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { EmployeesService } from '../../services/employees.service';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { tap } from 'rxjs';
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
import { MatDialog } from '@angular/material/dialog';
import { CheckAttendanceDialogComponent } from '../checkAttendanceDialog/checkAttendanceDialog.component';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataExtractorComponent } from '../data-extractor/data-extractor.component';
import { EmployeeEntity } from '../../entities/employee.entity';
import { SupabaseService } from '../../services/supabase.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-table-bi',
  templateUrl: './table-bi.component.html',
  styleUrls: ['./table-bi.component.css'],
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
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule,
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
export class TableBIComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'completeName',
    'startDate',
    'endDate',
    'startHour',
    'endHour',
    'totalSignings',
    'totalHours',
    'expand',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  employees: Employee[] = [];

  sortedEmployees: Employee[] = [];

  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>();

  expandedElement: Employee | undefined;

  savingData: boolean = false;

  constructor(
    readonly employeeService: EmployeesService,
    private readonly dialog: MatDialog,
    private readonly supabaseService: SupabaseService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.employeeService.employees$
      .pipe(
        tap((employeeList) => {
          this.employees = employeeList;
          this.sortedEmployees = this.employees;
          this.dataSource.data = this.sortedEmployees;
        })
      )
      .subscribe();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  exportTable() {
    TableUtil.exportTableToExcel('employeesTable', this.employees[0].startDate);
  }

  openCheckAttendanceDialog() {
    this.dialog.open(CheckAttendanceDialogComponent, {
      width: '60vw',
      height: '60vh',
      data: { employees: this.employees },
    });
  }

  openExtractDataDialog() {
    this.dialog.open(DataExtractorComponent);
  }

  async saveEmployees() {
    this.savingData = true;
    const employeesToSave: EmployeeEntity[] = this.employees.map((employee) => {
      return {
        complete_name: employee.completeName,
        start_date: employee.startDate,
        end_date: employee.endDate,
        signings: JSON.stringify(employee.signings),
        total_time: JSON.stringify(employee.totalTime),
      };
    });

    await this.supabaseService.saveEmployees(employeesToSave).then(() => {
      this._snackBar.open('Datos guardados correctamente', '', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 3000,
      });
    });
    this.savingData = false;
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

        case 'startDate':
          return this.compare(a.startDate, b.startDate, isAsc);

        case 'endDate':
          return this.compare(a.endDate, b.endDate, isAsc);

        case 'startHour':
          return this.compare(a.signings[0].hour, b.signings[0].hour, isAsc);

        case 'endHour':
          return this.compare(
            a.signings[a.signings.length - 1].hour,
            b.signings[b.signings.length - 1].hour,
            isAsc
          );

        case 'totalSignings':
          return this.compare(a.signings.length, b.signings.length, isAsc);

        case 'totalHours':
          const formatTime = (time: any) => {
            const hours = time.hours.toString().padStart(2, '0');
            const minutes = time.minutes.toString().padStart(2, '0');
            return hours + ':' + minutes;
          };
          return this.compare(
            formatTime(a.totalTime),
            formatTime(b.totalTime),
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
}
