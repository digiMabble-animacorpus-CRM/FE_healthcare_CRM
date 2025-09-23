'use client';

import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import LanguageForm from '../../languageForm';
import type { LanguageType } from '@/types/data';

interface Props {
  params: { id?: string };
}

const EditLanguagePage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Default values to prefill the form
  const [defaultValues, setDefaultValues] = useState<
    Partial<LanguageType & { language_id?: string | number }>
  >({});

  useEffect(() => {
    if (!params.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No access token found');

        const res = await axios.get(`${API_BASE_PATH}/languages/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const language = res.data;

        if (language?.id || language?._id) {
          setDefaultValues({
            language_name: language.language_name || '',
            language_description: language.language_description || '',
            is_active: language.is_active ?? true,
            language_id: language.id || language._id, // Use consistent key for backend
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load language details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Submit handler for updating the language
  const onSubmitHandler = async (
    data: Omit<LanguageType, 'id' | 'created_at' | 'updated_at'> & {
      language_id?: string | number;
    },
  ) => {
    if (!params.id) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      await axios.patch(
        `${API_BASE_PATH}/languages/${params.id}`,
        {
          language_name: data.language_name,
          language_description: data.language_description,
          is_active: data.is_active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success('Language updated successfully!');
      router.push('/languages');
    } catch (error) {
      console.error(error);
      toast.error('Error updating language');
    }
  };

  if (loading) return <div>Loading language details...</div>;

  return (
    <LanguageForm
      defaultValues={defaultValues}
      isEditMode
      onSubmitHandler={onSubmitHandler}
    />
  );
};

export default EditLanguagePage;
