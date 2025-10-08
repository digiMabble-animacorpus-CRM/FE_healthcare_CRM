'use client';

import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import BranchForm, { BranchFormValues } from '../branchForm';
import { API_BASE_PATH } from '@/context/constants';

const CreateBranchPage = () => {
  const router = useRouter();

  const handleCreate = async (data: BranchFormValues) => {
    try {
      const token = localStorage.getItem('access_token');

      const res = await fetch(`${API_BASE_PATH}/branches`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create branch');

      toast.success('Branch created successfully!');
      router.push('/branches');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create branch.');
    }
  };

  return <BranchForm />;
};

export default CreateBranchPage;
