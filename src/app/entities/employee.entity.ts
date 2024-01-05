import { Signing } from './employee';

export type EmployeeEntity = {
  id?: string;
  complete_name: string;
  phone?: string;
  start_date: string;
  end_date: string;
  signings: string;
  total_time: string;
  created_at?: string;
};

export type CompleteEmployee = {
  id: string;
  completeName: string;
  phone?: string;
  workedDays: WorkedDays[];
  totalHours: string;
};

export type WorkedDays = {
  startDate: string;
  endDate: string;
  workedHours: string;
  signings: Signing[];
};
