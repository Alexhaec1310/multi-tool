export type Employee = {
  completeName: string;
  startDate: string;
  endDate: string;
  signings: Signing[];
  totalTime: Time;
};

export type Signing = {
  hour: string;
  date: string;
};

export type Time = {
  hours: number;
  minutes: number;
};
