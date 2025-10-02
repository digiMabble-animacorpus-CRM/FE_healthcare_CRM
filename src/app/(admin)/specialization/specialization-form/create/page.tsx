
'use client';

import { API_BASE_PATH } from '@/context/constants';
import { useRouter } from 'next/navigation';
import SpecializationForm, { SpecializationFormValues } from '../specializationForm';

const CreateSpecializationPage = () => {
  const router = useRouter();

  const handleCreate = async (data: SpecializationFormValues) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      const res = await fetch(`${API_BASE_PATH}/specializations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log('Create specialization response:', res);

      if (!res.ok) throw new Error('Failed to create specialization');

      // toast.success('Specialization created successfully!');
      router.push('/specialization');
    } catch (error) {
      console.error(error);
      // toast.error('Failed to create specialization.');
    }
  };

  return <SpecializationForm onSubmitHandler={handleCreate} />;
};

export default CreateSpecializationPage;

