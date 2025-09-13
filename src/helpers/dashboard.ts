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