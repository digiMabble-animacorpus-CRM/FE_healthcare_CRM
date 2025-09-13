import React, { useEffect, useState } from 'react';
import BranchSummary, { BranchSummaryItem } from './BranchSummary';
import { getBranchSummary } from '@/helpers/dashboard';

const BranchSummaryContainer: React.FC = () => { // no props here
  const [summaries, setSummaries] = useState<BranchSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getBranchSummary();
        if (response && response.summaries) {
          const mappedData: BranchSummaryItem[] = response.summaries.map((item: any) => ({
            branchId: item.branch_id,
            branchName: item.branch_name,
            doctors: Number(item.therapists_count)?? 0,
            patients: item.patients_count,
            appointmentsMonth: item.appointments_count,
            revenueMonth: 0,
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

  return (
    <BranchSummary/>
  );
};

export default BranchSummaryContainer;
