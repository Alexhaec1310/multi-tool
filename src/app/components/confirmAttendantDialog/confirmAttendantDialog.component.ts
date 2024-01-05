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

@Component({
  selector: 'app-confirmAttendantDialog',
  templateUrl: './confirmAttendantDialog.component.html',
  styleUrls: ['./confirmAttendantDialog.component.css'],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatRadioModule],
})
export class ConfirmAttendantDialogComponent implements OnInit {
  employee: CompleteEmployee;
  today = new Date().toLocaleDateString();
  turn: 'morning' | 'afternoon' | 'night' | '' = '';
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
    if (this.turn === '') return;
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
    console.log(this.turn);
  }

  buildEmployeeForMorningTurn(): EmployeeEntity {
    const employee: EmployeeEntity = {
      id: this.employee.id,
      complete_name: this.employee.completeName,
      start_date: this.today,
      end_date: this.today,
      total_time: JSON.stringify({ hours: 8, minutes: 0 }),
      signings: JSON.stringify([
        {
          hour: '06:00',
          date: this.today,
        },
        {
          hour: '14:00',
          date: this.today,
        },
      ]),
    };

    return employee;
  }

  buildEmployeeForAfternoonTurn(): EmployeeEntity {
    const employee: EmployeeEntity = {
      id: this.employee.id,
      complete_name: this.employee.completeName,
      start_date: this.today,
      end_date: this.today,
      total_time: JSON.stringify({ hours: 8, minutes: 0 }),
      signings: JSON.stringify([
        {
          hour: '14:00',
          date: this.today,
        },
        {
          hour: '22:00',
          date: this.today,
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
      start_date: this.today,
      end_date: tomorrow.toLocaleDateString(),
      total_time: JSON.stringify({ hours: 8, minutes: 0 }),
      signings: JSON.stringify([
        {
          hour: '22:00',
          date: this.today,
        },
        {
          hour: '06:00',
          date: tomorrow.toLocaleDateString(),
        },
      ]),
    };

    return employee;
  }
}
