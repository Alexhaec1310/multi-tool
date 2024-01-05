import { SupabaseService } from './../../services/supabase.service';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  CompleteEmployee,
  EmployeeEntity,
} from '../../entities/employee.entity';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import {
  MatDatepickerIntl,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import 'moment/locale/es';
import moment from 'moment';
import { MatIconModule } from '@angular/material/icon';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-confirmAttendantDialog',
  templateUrl: './confirmAttendantDialog.component.html',
  styleUrls: ['./confirmAttendantDialog.component.css'],
  standalone: true,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
  ],
})
export class ConfirmAttendantDialogComponent implements OnInit {
  employee: CompleteEmployee;
  attendantDate = new Date().toLocaleDateString();
  turn: 'morning' | 'afternoon' | 'night' | '' = '';
  today = new Date();
  validForm = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmAttendantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly supabaseService: SupabaseService,
    private readonly _snackBar: MatSnackBar
  ) {
    this.employee = data.employee;
  }

  ngOnInit() {}

  confirmAttendant() {
    if (!this.validForm) {
      return;
    }

    let employee: EmployeeEntity = {} as EmployeeEntity;
    if (this.turn === 'morning') employee = this.buildEmployeeForMorningTurn();
    if (this.turn === 'afternoon')
      employee = this.buildEmployeeForAfternoonTurn();
    if (this.turn === 'night') employee = this.buildEmployeeForNightTurn();

    this.supabaseService.saveEmployee(employee).then((res) => {
      if (res) {
        this.dialogRef.close(true);
        this._snackBar.open('Fichaje confirmado', '', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    });
  }

  onChange(event: any) {
    this.turn = event.value;
    this.isValidForm();
  }

  buildEmployeeForMorningTurn(): EmployeeEntity {
    const employee: EmployeeEntity = {
      id: this.employee.id,
      complete_name: this.employee.completeName,
      start_date: this.attendantDate,
      end_date: this.attendantDate,
      total_time: JSON.stringify({ hours: 8, minutes: 0 }),
      signings: JSON.stringify([
        {
          hour: '06:00',
          date: this.attendantDate,
        },
        {
          hour: '14:00',
          date: this.attendantDate,
        },
      ]),
    };

    return employee;
  }

  buildEmployeeForAfternoonTurn(): EmployeeEntity {
    const employee: EmployeeEntity = {
      id: this.employee.id,
      complete_name: this.employee.completeName,
      start_date: this.attendantDate,
      end_date: this.attendantDate,
      total_time: JSON.stringify({ hours: 8, minutes: 0 }),
      signings: JSON.stringify([
        {
          hour: '14:00',
          date: this.attendantDate,
        },
        {
          hour: '22:00',
          date: this.attendantDate,
        },
      ]),
    };

    return employee;
  }

  buildEmployeeForNightTurn(): EmployeeEntity {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const employee: EmployeeEntity = {
      id: this.employee.id,
      complete_name: this.employee.completeName,
      start_date: this.attendantDate,
      end_date: tomorrow.toLocaleDateString(),
      total_time: JSON.stringify({ hours: 8, minutes: 0 }),
      signings: JSON.stringify([
        {
          hour: '22:00',
          date: this.attendantDate,
        },
        {
          hour: '06:00',
          date: tomorrow.toLocaleDateString(),
        },
      ]),
    };

    return employee;
  }

  dateChange(event: any) {
    this.attendantDate = moment(event.value).format('DD/MM/YYYY');
    this.isValidForm();
  }

  isValidForm() {
    this.validForm = this.attendantDate !== '' && this.turn !== '';
  }
}
