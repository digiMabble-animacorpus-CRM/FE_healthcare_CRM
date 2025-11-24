'use client';

import { getBranchSummary } from '@/helpers/dashboard';
import React, { useEffect, useState } from 'react';
import BranchSummary, { BranchSummaryItem, FilterOption } from './BranchSummary';
import axios from 'axios';
import { API_BASE_PATH } from '@/context/constants';
import { useNotificationContext } from '@/context/useNotificationContext';

// Utility function for cumulative summary
const getCumulativeSummary = (branches: BranchSummaryItem[]): BranchSummaryItem => ({
  branchId: 'all',
  branchName: 'Tous',
  doctors: branches.reduce((sum, b) => sum + (b.doctors || 0), 0),
  patients: branches.reduce((sum, b) => sum + (b.patients || 0), 0),
  appointmentsMonth: branches.reduce((sum, b) => sum + (b.appointmentsMonth || 0), 0),
  revenueMonth: 0, 
});

const BranchSummaryContainer: React.FC = () => {
  const { showNotification } = useNotificationContext();
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
            revenueMonth: 0, 
          }));

         
          const cumulativeSummary = getCumulativeSummary(mappedData);
          
          const fullData = [cumulativeSummary, ...mappedData];

          setAllSummaries(fullData);

         
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

  
  const fetchTotals = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE_PATH}/dashboard/totals`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const apiBody = res.data ?? {};

      
      if (apiBody?.status === false) {
        showNotification?.({ message: 'Total fetch fail', variant: 'danger' });
        return;
      }

    
      if (apiBody?.status !== true) {
      
        showNotification?.({ message: 'Total fetch fail', variant: 'danger' });
        return;
      }

      const payload = apiBody.data ?? {};
      if (
        payload == null ||
        (payload.totalTherapists == null &&
          payload.totalPatients == null &&
          payload.totalAppointments == null)
      ) {
        showNotification?.({ message: 'Total fetch fail', variant: 'danger' });
        return;
      }

      const allItem: BranchSummaryItem = {
        branchId: 'all',
        branchName: 'Tous',
        doctors: payload.totalTherapists ?? 0,
        patients: payload.totalPatients ?? 0,
        appointmentsMonth: payload.totalAppointments ?? 0,
        revenueMonth: 0,
      };

     
      setAllSummaries((prev) => {
        const others = prev.filter((p) => String(p.branchId) !== 'all');
        const updated = [allItem, ...others];
    
        const filteredBranchSummaries = updated
          .filter((branch) => branch.branchId !== 'all')
          .map((branch) => {
            const branchFilter = branchFilters[branch.branchId] || 'month';
            switch (branchFilter) {
              case 'thisWeek':
              case 'lastWeek':
                return { ...branch, appointmentsMonth: Math.floor(branch.appointmentsMonth / 4) };
              case 'month':
              default:
                return branch;
            }
          });
        const cumulative = allItem; 
        setSummaries([cumulative, ...filteredBranchSummaries]);
        return updated;
      });

      setBranchFilters((prev) => ({ ...prev, ['all']: 'overall' }));

   
      showNotification?.({ message: apiBody.message ?? 'Totals loaded', variant: 'success' });
    } catch (err: any) {
      console.error('Failed to fetch totals:', err);

    
      const serverMessage = err?.response?.data?.message;
   
      showNotification?.({ message: 'Total fetch fail', variant: 'danger' });

      if (serverMessage) {
        console.debug('Totals API message:', serverMessage);
      }
    }
  };


  const applyFilterToData = (
    branch: BranchSummaryItem,
    filter: FilterOption,
  ): BranchSummaryItem => {
    let filteredAppointments = branch.appointmentsMonth; 

    switch (filter) {
      case 'thisWeek':
        filteredAppointments = Math.floor(branch.appointmentsMonth / 4); 
        break;
      case 'lastWeek':
        filteredAppointments = Math.floor(branch.appointmentsMonth / 4);
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

     
      const filteredBranchSummaries = allSummaries
        .filter((branch) => branch.branchId !== 'all')
        .map((branch) => {
          const branchFilter = updatedFilters[branch.branchId] || 'month';
          return applyFilterToData(branch, branchFilter);
        });

     
      const cumulativeSummary = getCumulativeSummary(filteredBranchSummaries);

    
      const updatedSummaries = [cumulativeSummary, ...filteredBranchSummaries];

      setSummaries(updatedSummaries);
      return updatedFilters;
    });
  };

  if (loading) return <div>Loading branch summaries...</div>;
  if (error) return <div>{error}</div>;

  return (
    <BranchSummary
      summaries={allSummaries}
      filters={branchFilters}
      onFilterChange={handleFilterChange}
      onRequestTotals={fetchTotals}
    />
  );
};

export default BranchSummaryContainer;

