import { Injectable } from '@angular/core';
import { Employee } from '../entities/employee';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);

  public employees$: Observable<Employee[]> =
    this.employeesSubject.asObservable();

  constructor() {}

  setEmployees(employees: Employee[]) {
    this.employeesSubject.next(employees);
  }
}
