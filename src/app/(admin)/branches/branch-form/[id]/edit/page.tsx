'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import BranchForm, { BranchFormValues } from '../../branchForm';
import { API_BASE_PATH } from '@/context/constants';

interface Props {
  params: { id?: string };
}

const EditBranchPage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<Partial<BranchFormValues & { branch_id?: string }>>({});
  const isEditMode = Boolean(params.id);

  useEffect(() => {
    if (!params.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No access token found');

        const res = await fetch(`${API_BASE_PATH}/branches/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch branch');

        const branch = await res.json();

        if (branch?.branch_id) {
          setDefaultValues({
            name: branch.name || '',
            phone: branch.phone || '',
            email: branch.email || '',
            address: branch.address || '',
            location: branch.location || '',
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load branch details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const onSubmitHandler = async (data: BranchFormValues & { branch_id?: string }) => {
    if (!params.id) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const res = await fetch(`${API_BASE_PATH}/branches/${params.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update branch');

      toast.success('Branch updated successfully!');
      router.push('/branches');
    } catch (error) {
      console.error(error);
      toast.error('Error updating branch');
    }
  };

  if (loading) return <div>Loading branch details...</div>;

  return (
    <BranchForm
      defaultValues={defaultValues}
      isEditMode
      onSubmitHandler={onSubmitHandler}
    />
  );
};

export default EditBranchPage;
