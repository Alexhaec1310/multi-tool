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

  getEmployees() {
    return this.supabase.from('employees').select('*');
  }

  async saveEmployees(employeesList: EmployeeEntity[]) {
    await this.supabase.from('employees').upsert(employeesList, {
      onConflict: 'complete_name, start_date, end_date',
    });
  }
}
