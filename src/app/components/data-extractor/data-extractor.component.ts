import { Component, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import moment from 'moment';
import { Employee, Signing, Time } from '../../entities/employee';
import { EmployeesService } from '../../services/employees.service';

@Component({
  selector: 'app-data-extractor',
  templateUrl: './data-extractor.component.html',
  styleUrls: ['./data-extractor.component.css'],
  standalone: true,
  imports: [
    MatInputModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class DataExtractorComponent implements OnInit {
  title: string = 'Extraer datos de fichajes';
  fileName = '';
  emptyFileName = 'Aún no se ha subido archivo. OBLIGATORIO .csv';
  fileSelected: File | undefined = undefined;
  extractingdata: boolean = false;
  employeeList: Employee[] = [];

  constructor(private readonly employeeService: EmployeesService) {}

  ngOnInit() {}

  onFileChange(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      if (file.type != 'text/csv') {
        console.log('Error: El archivo debe ser de tipo CSV');
        return;
      }

      this.fileSelected = file;

      this.fileName = file.name;
    }
  }

  convertData() {
    this.extractingdata = true;
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = (e.target as FileReader).result as string;
      this.employeeList = this.processFile(text);
      this.employeeService.setEmployees(this.employeeList);
      this.extractingdata = false;
    };
    reader.readAsText(this.fileSelected!);
  }

  processFile(text: string) {
    let lines = text.split(/\r\n|\n/);

    // 1. Eliminar las primeras 8 líneas
    lines = lines.slice(8);

    // 2. Eliminar todas las ocurrencias de "1,00"
    lines = lines.map((linea) => linea.replace(/"1,00"/g, ''));

    // 3. Reemplazar todas las comillas restantes por dobles guiones
    lines = lines.map((linea) => linea.replace(/"/g, '--'));

    // 4. Eliminar líneas que contienen 'JOBANDTALENT'
    lines = lines.filter((linea) => !linea.includes('JOBANDTALENT'));

    // 5. Eliminar comas al final de cada línea
    lines = lines.map((linea) => linea.replace(/,$/, ''));

    // 6. Agregar una línea con ************* antes de las líneas que empiezan con --
    lines = lines.reduce((acc: string[], line) => {
      if (line.startsWith('--') && line.endsWith('--')) {
        acc.push('*************');
      }
      acc.push(line);
      return acc;
    }, []);

    // 7. Eliminar líneas que contienen 'Total,'
    lines = lines.filter((linea) => !linea.includes('Total,'));

    const modified = lines.join('\n');

    return this.extractDataToObject(modified);
  }

  extractDataToObject(textModified: string): Employee[] {
    const employeesSplit = textModified
      .split('*************\n')
      .filter((employeeBlock) => employeeBlock.trim() !== '');
    return employeesSplit.map((employeeBlock) => {
      const lines = employeeBlock.trim().split('\n');

      const completeName = lines[0].replace(/--/g, '').trim();
      const signings: Signing[] = [];
      const startDate = lines[1].split('\n')[0];
      let endDate = lines[1].split('\n')[0];

      for (let i = 1; i < lines.length; i += 2) {
        if (lines[i] && lines[i + 1]) {
          signings.push({
            hour: lines[i + 1].split('\n')[0],
            date: startDate,
          });
        }
      }

      let totalTime = this.calculateTotalHours(
        startDate,
        endDate,
        signings[0].hour,
        signings[signings.length - 1].hour
      );

      if (totalTime.hours > 11) {
        let firstHour = signings.pop();

        endDate = this.addDayToDate(startDate);

        signings.forEach((signing) => {
          signing.date = endDate;
        });

        signings.unshift(firstHour!);

        totalTime = this.calculateTotalHours(
          startDate,
          endDate,
          signings[0]!.hour,
          signings[signings.length - 1]!.hour
        );
      }

      const employee: Employee = {
        completeName,
        startDate,
        endDate,
        signings,
        totalTime,
      };
      return employee;
    });
  }

  calculateTotalHours(
    startDate: string,
    endDate: string,
    firstHour: string,
    lastHour: string
  ): Time {
    const formatDateHour = 'DD/MM/YYYY HH:mm:ss';
    const start = moment(`${startDate} ${firstHour}`, formatDateHour);
    const end = moment(`${endDate} ${lastHour}`, formatDateHour);
    const duration = moment.duration(end.diff(start));

    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes() % 60);

    return {
      hours,
      minutes,
    };
  }

  addDayToDate(date: string) {
    const splits = date.split('/');
    const day = parseInt(splits[0], 10);
    const month = parseInt(splits[1], 10) - 1;
    const year = parseInt(splits[2], 10);

    const newDate = new Date(year, month, day);
    newDate.setDate(newDate.getDate() + 1);

    const newDay = newDate.getDate().toString().padStart(2, '0');
    const newMonth = (newDate.getMonth() + 1).toString().padStart(2, '0');
    const newYear = newDate.getFullYear();

    return `${newDay}/${newMonth}/${newYear}`;
  }

  saveModifiedFile(textModified: string): void {
    const blob = new Blob([textModified], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archivo-modificado.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
