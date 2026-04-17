import { mockAttendanceRecords, mockCanteenReport } from '@/data';
import type { AttendanceRecord, CanteenReport } from '@/types';

// TODO: Replace with actual Supabase/API calls later
export const getAttendanceOverview = async (): Promise<AttendanceRecord[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAttendanceRecords);
    }, 500); // Simulate network latency
  });
};

export const getAttendanceClassDetails = async (classId: string): Promise<AttendanceRecord | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const record = mockAttendanceRecords.find((r) => r.id === classId);
      resolve(record);
    }, 300);
  });
};

export const getCanteenReport = async (): Promise<CanteenReport> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCanteenReport);
    }, 400);
  });
};
