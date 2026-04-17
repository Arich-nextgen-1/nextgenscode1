import { mockIncidents } from '@/data';
import type { Incident } from '@/types';

// TODO: Replace with actual Supabase/API calls later
export const getIncidents = async (): Promise<Incident[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockIncidents);
    }, 500); // Simulate network latency
  });
};

export const getIncidentById = async (id: string): Promise<Incident | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const incident = mockIncidents.find((i) => i.id === id);
      resolve(incident);
    }, 300);
  });
};
