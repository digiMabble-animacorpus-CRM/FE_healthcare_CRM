'use client';

import React, { useEffect, useState } from 'react';
import BranchSummary, { BranchSummaryItem } from './BranchSummary';
import { getBranchSummary } from '@/helpers/dashboard';

const BranchSummaryContainer: React.FC = () => {
  const [summaries, setSummaries] = useState<BranchSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('BranchSummaryContainer useEffect triggered');;
    const fetchData = async () => {
      console.log('BranchSummaryContainer rendered with summaries:', summaries);
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
            revenueMonth: 0, // placeholder if revenue data is not available
          }));
          setSummaries(mappedData);
        } else {
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

  if (loading) return <div>Loading branch summaries...</div>;
  if (error) return <div>{error}</div>;

  return <BranchSummary summaries={summaries} />;
};

export default BranchSummaryContainer;
