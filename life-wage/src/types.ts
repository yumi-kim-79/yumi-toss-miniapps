export interface WageUser {
  monthlySalary: number;
  monthlyHours: number;
  hourlyWage: number;
}

export interface WageRecord {
  id: string;
  userId: string;
  amount: number;
  hoursWorth: number;
  memo: string;
  createdAt: Date;
}
