'use client';

import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SpecializationForm, { SpecializationFormValues } from '../../specializationForm';

export interface Props {
  defaultValues?: Partial<SpecializationFormValues>;
  isEditMode?: boolean;
  onSubmitHandler?: (data: SpecializationFormValues & { specialization_id?: string }) => void;
}

const EditSpecializationPage = ({ params }: { params: { id?: string } }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<
    Partial<SpecializationFormValues & { specialization_id?: string }>
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

        const res = await axios.get(`${API_BASE_PATH}/specializations/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const specialization = res.data;

        if (specialization?.specialization_id) {
          setDefaultValues({
            department_id: specialization.department?.id || '',
            specialization_type: specialization.specialization_type || '',
            description: specialization.description || '',
            is_active: specialization.is_active ?? true,
            specialization_id: specialization.specialization_id,
          });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load specialization details' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const onSubmitHandler = async (
    data: SpecializationFormValues & { specialization_id?: string },
  ) => {
    if (!params.id) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      await axios.patch(
        `${API_BASE_PATH}/specializations/${params.id}`,
        {
          department_id: data.department_id,
          specialization_type: data.specialization_type,
          description: data.description,
          is_active: data.is_active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      router.push('/specialization');
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating specialization' });
    }
  };

  if (loading) return <div>Loading specialization details...</div>;

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
      <SpecializationForm
        defaultValues={defaultValues}
        isEditMode
        onSubmitHandler={onSubmitHandler}
      />
    </div>
  );
};

export default EditSpecializationPage;
