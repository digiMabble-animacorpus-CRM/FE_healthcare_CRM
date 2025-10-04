// BranchSummaryContainer.tsx
'use client';

import { getBranchSummary } from '@/helpers/dashboard';
import React, { useEffect, useState } from 'react';
import BranchSummary, { BranchSummaryItem, FilterOption } from './BranchSummary';

const BranchSummaryContainer: React.FC = () => {
  const [allSummaries, setAllSummaries] = useState<BranchSummaryItem[]>([]); // full data from backend
  const [summaries, setSummaries] = useState<BranchSummaryItem[]>([]); // filtered data for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchFilters, setBranchFilters] = useState<Record<string | number, FilterOption>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getBranchSummary();
        if (response && response.summaries) {
          const mappedData: BranchSummaryItem[] = response.summaries.map((item: any) => ({
            branchId: item.branchId,
            branchName: item.branchName,
            doctors: item.doctors,
            patients: item.patients,
            appointmentsMonth: item.appointmentsMonth,
            revenueMonth: 0, // placeholder
          }));
          setAllSummaries(mappedData);

          // Initialize all filters to 'month'
          const initialFilters: Record<string | number, FilterOption> = {};
          mappedData.forEach((item) => {
            initialFilters[item.branchId] = 'month';
          });
          setBranchFilters(initialFilters);
          setSummaries(mappedData);
        } else {
          setAllSummaries([]);
          setSummaries([]);
        }
      } catch (err) {
        setError('Failed to load branch summaries.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simulated filtering logic on data based on filter type
  const applyFilterToData = (branch: BranchSummaryItem, filter: FilterOption): BranchSummaryItem => {
    let filteredAppointments = branch.appointmentsMonth; // fallback to monthly data

    switch (filter) {
      case 'thisWeek':
        filteredAppointments = Math.floor(branch.appointmentsMonth / 4); // simplistic approx this week
        break;
      case 'lastWeek':
        filteredAppointments = Math.floor(branch.appointmentsMonth / 4); // approx last week same as this week for demo
        break;
      case 'month':
      default:
        filteredAppointments = branch.appointmentsMonth;
    }

    return { ...branch, appointmentsMonth: filteredAppointments };
  };

  const handleFilterChange = (branchId: string | number, filter: FilterOption) => {
    setBranchFilters((prev) => {
      const updatedFilters = { ...prev, [branchId]: filter };

      // Apply filters to data and update summaries state
      const updatedSummaries = allSummaries.map((branch) => {
        const branchFilter = updatedFilters[branch.branchId] || 'month';
        return applyFilterToData(branch, branchFilter);
      });

      setSummaries(updatedSummaries);
      return updatedFilters;
    });
  };

  if (loading) return <div>Loading branch summaries...</div>;
  if (error) return <div>{error}</div>;

  return <BranchSummary summaries={summaries} filters={branchFilters} onFilterChange={handleFilterChange} />;
};

export default BranchSummaryContainer;
