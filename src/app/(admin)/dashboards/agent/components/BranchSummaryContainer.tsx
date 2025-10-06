// BranchSummaryContainer.tsx
'use client';

import { getBranchSummary } from '@/helpers/dashboard';
import React, { useEffect, useState } from 'react';
import BranchSummary, { BranchSummaryItem, FilterOption } from './BranchSummary';

// Utility function for cumulative summary
const getCumulativeSummary = (branches: BranchSummaryItem[]): BranchSummaryItem => ({
  branchId: 'all',
  branchName: 'Tous',
  doctors: branches.reduce((sum, b) => sum + (b.doctors || 0), 0),
  patients: branches.reduce((sum, b) => sum + (b.patients || 0), 0),
  appointmentsMonth: branches.reduce((sum, b) => sum + (b.appointmentsMonth || 0), 0),
  revenueMonth: 0, // Placeholder - sum revenue if actual data exists
});

const BranchSummaryContainer: React.FC = () => {
  const [allSummaries, setAllSummaries] = useState<BranchSummaryItem[]>([]); // raw backend + cumulative
  const [summaries, setSummaries] = useState<BranchSummaryItem[]>([]); // filtered for UI
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
            revenueMonth: 0, // Placeholder
          }));

          // Cumulative "All Branches" summary
          const cumulativeSummary = getCumulativeSummary(mappedData);
          // Prepend cumulative summary
          const fullData = [cumulativeSummary, ...mappedData];

          setAllSummaries(fullData);

          // Initialize all filters to 'month'
          const initialFilters: Record<string | number, FilterOption> = { all: 'month' };
          fullData.forEach((item) => {
            initialFilters[item.branchId] = 'month';
          });
          setBranchFilters(initialFilters);
          setSummaries(fullData);
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
  const applyFilterToData = (
    branch: BranchSummaryItem,
    filter: FilterOption,
  ): BranchSummaryItem => {
    let filteredAppointments = branch.appointmentsMonth; // fallback to monthly data

    switch (filter) {
      case 'thisWeek':
        filteredAppointments = Math.floor(branch.appointmentsMonth / 4); // Approximate for this week
        break;
      case 'lastWeek':
        filteredAppointments = Math.floor(branch.appointmentsMonth / 4); // Same for demo
        break;
      case 'month':
      default:
        filteredAppointments = branch.appointmentsMonth;
    }

    return { ...branch, appointmentsMonth: filteredAppointments };
  };

  // Branch-wise and cumulative filtering handler
  const handleFilterChange = (branchId: string | number, filter: FilterOption) => {
    setBranchFilters((prev) => {
      const updatedFilters = { ...prev, [branchId]: filter };

      // Apply filters to each branch except 'all'
      const filteredBranchSummaries = allSummaries
        .filter((branch) => branch.branchId !== 'all')
        .map((branch) => {
          const branchFilter = updatedFilters[branch.branchId] || 'month';
          return applyFilterToData(branch, branchFilter);
        });

      // For 'all' (cumulative) summary, filter is 'all' or defaults to 'month'
      const cumulativeSummary = getCumulativeSummary(filteredBranchSummaries);

      // Add cumulative summary at the top
      const updatedSummaries = [cumulativeSummary, ...filteredBranchSummaries];

      setSummaries(updatedSummaries);
      return updatedFilters;
    });
  };

  if (loading) return <div>Loading branch summaries...</div>;
  if (error) return <div>{error}</div>;

  return (
    <BranchSummary
      summaries={summaries}
      filters={branchFilters}
      onFilterChange={handleFilterChange}
    />
  );
};

export default BranchSummaryContainer;
