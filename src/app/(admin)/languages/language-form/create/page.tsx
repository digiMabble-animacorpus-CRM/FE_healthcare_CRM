'use client';

import { API_BASE_PATH } from '@/context/constants';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import LanguageForm, { LanguageFormValues } from '../languageForm';

const CreateLanguagePage = () => {
  const router = useRouter();

  const handleCreate = async (data: LanguageFormValues) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('No access token found!');
        return;
      }

      const payload = {
        language_name: data.label,
        language_description: data.key || '',
      };

      const res = await fetch(`${API_BASE_PATH}/languages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create language');

      toast.success('Language created successfully!');
      router.push('/languages');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create Language.');
    }
  };

  return <LanguageForm onSubmitHandler={handleCreate} />;
};

export default CreateLanguagePage;
