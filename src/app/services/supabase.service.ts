import { Injectable } from '@angular/core';
import {
  AuthSession,
  SupabaseClient,
  createClient,
} from '@supabase/supabase-js';
import { environment } from '../../../environment';
import { EmployeeEntity } from '../entities/employee.entity';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  _session: AuthSession | null = null;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session;
    });
    return this._session;
  }

  async getEmployees(month: number, year: number) {
    const employees = await this.supabase
      .from('employees')
      .select('*')
      .filter('start_date', 'ilike', `%${month}/${year}%`)
      .order('complete_name', { ascending: true })
      .limit(1000);

    const employeeData = await this.getEmployeeData();

    if (employees.data!.length > 0) {
      return employees.data!.map((employee) => {
        const employeePhone = employeeData.data!.find(
          (employeeData) =>
            employeeData.complete_name === employee.complete_name
        );

        const phone = employeePhone ? employeePhone.phone_number : 'Sin número';

        return {
          ...employee,
          phone: phone,
        };
      });
    }

    return [];
  }

  async getEmployeeByCompleteName(completeName: string) {
    const employee = await this.supabase
      .from('employees')
      .select('*')
      .filter('complete_name', 'eq', completeName);

    const { data, error } = await this.getEmployeeDataByCompleteName(
      completeName
    );

    let phone = 'Sin número';

    if (data && data.length > 0) {
      phone = data[0].phone_number;
    }

    const newEmployeeList = employee.data?.map((employee) => {
      return {
        ...employee,
        phone,
      };
    });

    console.log(newEmployeeList);
    return newEmployeeList;
  }

  saveEmployee(employee: EmployeeEntity) {
    return this.supabase.from('employees').upsert([employee]);
  }

  async saveEmployees(employeesList: EmployeeEntity[]) {
    await this.supabase.from('employees').upsert(employeesList, {
      onConflict: 'complete_name, start_date, end_date',
    });
  }

  getEmployeeData() {
    return this.supabase.from('employee_data').select('*');
  }

  getEmployeeDataByCompleteName(completeName: string) {
    return this.supabase
      .from('employee_data')
      .select('*')
      .filter('complete_name', 'eq', completeName);
  }
}
