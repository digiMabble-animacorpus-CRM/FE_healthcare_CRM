'use client';

import { API_BASE_PATH } from '@/context/constants';
import { useRouter } from 'next/navigation';
import DepartmentForm, { DepartmentFormValues } from '../departmentForm';

const CreateDepartmentPage = () => {
  const token = localStorage.getItem('access_token');
  const router = useRouter();

  const handleCreate = async (data: DepartmentFormValues) => {
    try {
      const res = await fetch(`${API_BASE_PATH}/departments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create department');

      // toast.success('Department created successfully!');
      router.push('/department');
    } catch (error) {
      console.error(error);
      // toast.error('Failed to create Department.');
    }
  };

  return <DepartmentForm onSubmitHandler={handleCreate} />;
};

export default CreateDepartmentPage;
