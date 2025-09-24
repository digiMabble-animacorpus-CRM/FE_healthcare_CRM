'use client';

import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import LanguageForm, { LanguageFormValues } from '../../languageForm';

interface Props {
  params: { id?: string };
}

const EditLanguagePage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Default values to prefill the form
  const [defaultValues, setDefaultValues] = useState<
    Partial<LanguageFormValues & { _id?: string }>
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

        console.log('API Response:', res.data);

        // Adjust this if your API wraps data
        const language = res.data.data || res.data;

        if (language?.id || language?._id) {
          setDefaultValues({
            key: language.language_name || '',
            label: language.language_description || '',
            is_active: language.is_active ?? true,
            _id: language.id || language._id, // consistent ID key
          });
        } else {
          toast.error('Invalid language data received');
        }
      } catch (err) {
        console.error('Error fetching language details:', err);
        toast.error('Failed to load language details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Submit handler for updating the language
  const onSubmitHandler = async (data: LanguageFormValues) => {
    if (!params.id) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');

      await axios.patch(
        `${API_BASE_PATH}/languages/${params.id}`,
        {
          language_name: data.key,
          language_description: data.label,
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
      console.error('Update error:', error);
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
