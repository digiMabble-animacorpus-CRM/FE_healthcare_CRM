'use client';

import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DepartmentForm, { DepartmentFormValues } from '../../departmentForm';
import { useNotificationContext } from '@/context/useNotificationContext';

export interface Props {
  defaultValues?: Partial<DepartmentFormValues>;
  isEditMode?: boolean;
  onSubmitHandler?: (data: DepartmentFormValues & { department_id?: string }) => void;
}

const EditDepartmentPage = ({ params }: { params: { id?: string } }) => {
  const router = useRouter();
  const { showNotification } = useNotificationContext();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<
    Partial<DepartmentFormValues & { department_id?: string }>
  >({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
            department_id: department.id,
          });
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to load department details' });
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

      await axios.patch(
        `${API_BASE_PATH}/departments/${params.id}`,
        {
          name: data.name,
          description: data.description,
          is_active: data.is_active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      showNotification({
        message: 'Département mis à jour avec succès !',
        variant: 'success',
      });

      router.push('/department');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error updating department' });
    }
  };

  if (loading) return <div>Loading department details...</div>;

  return (
    <div>
      {message && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            color: message.type === 'success' ? '#0f5132' : '#842029',
            backgroundColor: message.type === 'success' ? '#d1e7dd' : '#f8d7da',
            border: `1px solid ${message.type === 'success' ? '#badbcc' : '#f5c2c7'}`,
          }}
        >
          {message.text}
        </div>
      )}
      <DepartmentForm defaultValues={defaultValues} isEditMode onSubmitHandler={onSubmitHandler} />
    </div>
  );
};

export default EditDepartmentPage;
