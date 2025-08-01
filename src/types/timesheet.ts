export interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  isPaid: boolean;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailySummary {
  date: string;
  totalHours: number;
  totalEarnings: number;
  entriesCount: number;
  isPaid: boolean;
}

export interface TimesheetStats {
  totalHours: number;
  totalEarnings: number;
  paidHours: number;
  unpaidHours: number;
  paidEarnings: number;
  unpaidEarnings: number;
  averageHoursPerDay: number;
  daysWorked: number;
}