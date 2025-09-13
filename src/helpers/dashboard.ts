'use client';

import { API_BASE_PATH } from '@/context/constants';

export interface Demographics {
  gender: { male: number; female: number; other: number };
  topCities: { city: string; count: number }[];
  ageBuckets: { label: string; value: number; percent: number }[];
}

export interface PatientsDashboardData {
  newPatientsWeek: number;
  newPatientsMonth: number;
  demographics: Demographics;
}

// Existing getPatientsDashboardData function (unchanged)
export const getPatientsDashboardData = async (): Promise<PatientsDashboardData | null> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found.');
      return null;
    }
    
    const response = await fetch(`${API_BASE_PATH}/dashboard/patients`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch patients dashboard data:', response.status, errorText);
      return null;
    }
    
    const result = await response.json();
    
    if (!result.status || !result.data) {
      console.error('API returned unsuccessful status or empty data');
      return null;
    }
    
    const data = result.data;

    // Calculate total gender count for percentage conversion
    const totalGenderCount =
      (data.gender_distribution?.male ?? 0) +
      (data.gender_distribution?.female ?? 0) +
      (data.gender_distribution?.other ?? 0);

    // Convert gender counts to percentage
    const genderPercentages = {
      male: totalGenderCount ? ((data.gender_distribution?.male ?? 0) / totalGenderCount) * 100 : 0,
      female: totalGenderCount ? ((data.gender_distribution?.female ?? 0) / totalGenderCount) * 100 : 0,
      other: totalGenderCount ? ((data.gender_distribution?.other ?? 0) / totalGenderCount) * 100 : 0,
    };

    const demographics: Demographics = {
      gender: {
        male: Number(genderPercentages.male.toFixed(1)), // rounded to 1 decimal place
        female: Number(genderPercentages.female.toFixed(1)),
        other: Number(genderPercentages.other.toFixed(1)),
      },
      topCities: (data.branch_distribution || [])
        .filter((item: any) => item.branch_name !== null)
        .map((item: any) => ({
          city: item.branch_name,
          count: Number(item.count),
        })),
      ageBuckets: (data.age_distribution || []).map((item: any) => ({
        label: item.range,
        value: Number(item.count),
        percent: Number(item.percentage),
      })),
    };

    return {
      newPatientsWeek: data.new_patients?.week ?? 0,
      newPatientsMonth: data.new_patients?.month ?? 0,
      demographics,
    };
  } catch (error) {
    console.error('Error fetching patients dashboard data:', error);
    return null;
  }
};

// New helper function to fetch appointments calendar data
export interface CalendarAppointment {
  id: number | string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  doctorName?: string;
  branchName?: string;
  status?: string;
}

export interface CalendarAppointmentsResponse {
  appointments: CalendarAppointment[];
}

export const getCalendarAppointments = async (
  params: {
    startDate: string;
    endDate: string;
    doctorId?: number;
    branchId?: number;
    timeFilter?: string;
  }
): Promise<CalendarAppointmentsResponse | null> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found.');
      return null;
    }

    const query = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.doctorId ? { doctorId: String(params.doctorId) } : {}),
      ...(params.branchId ? { branchId: String(params.branchId) } : {}),
      ...(params.timeFilter ? { timeFilter: params.timeFilter } : {}),
    }).toString();

    const response = await fetch(`${API_BASE_PATH}/dashboard/appointments/calendar?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch calendar appointments:', response.status, errorText);
      return null;
    }

    const result = await response.json();

    return {
      appointments: result.data ?? [],
    };
  } catch (error) {
    console.error('Error fetching calendar appointments:', error);
    return null;
  }
};

// Appointment stats interfaces
export interface AppointmentStats {
  totalAppointments: number;
  completed: number;
  cancellations: number;
}

export interface AppointmentStatsResponse {
  stats: AppointmentStats | null;
}

// Helper to fetch appointment stats
export const getAppointmentStats = async (
  params: {
    startDate: string;
    endDate: string;
    doctorId?: number;
    branchId?: number;
    timeFilter?: string;
  }
): Promise<AppointmentStatsResponse | null> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found.');
      return null;
    }

    const query = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.doctorId ? { doctorId: String(params.doctorId) } : {}),
      ...(params.branchId ? { branchId: String(params.branchId) } : {}),
      ...(params.timeFilter ? { timeFilter: params.timeFilter } : {}),
    }).toString();

    const response = await fetch(
      `${API_BASE_PATH}/dashboard/appointments/stats?${query}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch appointment stats:', response.status, errorText);
      return null;
    }

    const result = await response.json();

    if (!result.status || !result.data) {
      console.error('API returned unsuccessful status or empty data');
      return { stats: null };
    }

    // Adjust according to your API response structure
    return {
      stats: {
        totalAppointments: result.data.total ?? 0,
        completed: result.data.completed ?? 0,
        cancellations: result.data.cancellations ?? 0,
      },
    };

  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    return null;
  }
};

// Interface for branch summary card data
export interface BranchSummary {
  branch: string;
  therapists: number;
  patients: number;
  appointmentsMonth: number;
}

// Response interface for branch summary API
export interface BranchSummaryResponse {
  summaries: BranchSummary[];
}

// Helper to fetch branch summary card data
export const getBranchSummary = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found.');
      return null;
    }

    const response = await fetch(`${API_BASE_PATH}/dashboard/branches/summary`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch branch summary:', response.status, errorText);
      return null;
    }

    const result = await response.json();

    // If API returns array directly, treat it as data
    const dataArray = Array.isArray(result) ? result : [];

    if (!dataArray.length) {
      console.warn('Branch summary API returned empty data');
      return null;
    }

    // Map API fields to frontend BranchSummaryItem shape
    const summaries = dataArray.map((item: any) => ({
      branchId: item.branch_id,
      branchName: item.branch_name,
      doctors: Number(item.therapists_count) ?? 0,
      patients: Number(item.patients_count) ?? 0,
      appointmentsMonth: Number(item.appointments_count)?? 0,
      revenueMonth: 0, // default placeholder; update if API provides revenue
    }));

    return { summaries };
  } catch (error) {
    console.error('Error fetching branch summary:', error);
    return null;
  }
};

