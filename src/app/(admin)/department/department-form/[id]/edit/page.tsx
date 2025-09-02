'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import DepartmentForm, { DepartmentFormValues } from '../../departmentForm';
import { API_BASE_PATH } from '@/context/constants';

interface Props {
  params: { id?: string };
}

const EditDepartmentPage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<Partial<DepartmentFormValues & { department_id?: string }>>({});
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

        const res = await fetch(`${API_BASE_PATH}/departments/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch department');

        const department = await res.json();

        if (department?.department_id) {
          setDefaultValues({
            name: department.name || '',
            description: department.description || '',
            is_active: department.is_active ?? true,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load department details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const onSubmitHandler = async (data: DepartmentFormValues & { department_id?: string }) => {
    if (!params.id) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const res = await fetch(`${API_BASE_PATH}/departments/${params.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update department');

      toast.success('Department updated successfully!');
      router.push('/departments');
    } catch (error) {
      console.error(error);
      toast.error('Error updating department');
    }
  };

  if (loading) return <div>Loading department details...</div>;

  return (
    <DepartmentForm
      defaultValues={defaultValues}
      isEditMode
      onSubmitHandler={onSubmitHandler}
    />
  );
};

export default EditDepartmentPage;
