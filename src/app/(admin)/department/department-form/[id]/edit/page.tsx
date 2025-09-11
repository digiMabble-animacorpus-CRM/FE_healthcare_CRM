'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import DepartmentForm, { DepartmentFormValues } from '../../departmentForm';
import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';

export interface Props {
  defaultValues?: Partial<DepartmentFormValues>;
  isEditMode?: boolean;
  onSubmitHandler?: (data: DepartmentFormValues & { department_id?: string }) => void;
}

const EditDepartmentPage = ({ params }: { params: { id?: string } }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<
    Partial<DepartmentFormValues & { department_id?: string }>
  >({});
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

        const res = await axios.get(`${API_BASE_PATH}/departments/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const department = res.data;

        if (department?.id) {
          setDefaultValues({
            name: department.name || '',
            description: department.description || '',
            is_active: department.is_active ?? true,
            department_id: department.id, // Use department_id as expected by the type
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

  const onSubmitHandler = async (
    data: DepartmentFormValues & { department_id?: string }
  ) => {
    if (!params.id) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      await axios.patch(`${API_BASE_PATH}/departments/${params.id}`, {
        name: data.name,
        description: data.description,
        is_active: data.is_active,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Department updated successfully!');
      router.push('/department');
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
