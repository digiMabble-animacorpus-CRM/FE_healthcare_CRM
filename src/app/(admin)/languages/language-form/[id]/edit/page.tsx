'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LanguageType } from '@/types/data';
import { getLanguageById } from '@/helpers/languages';
import LanguageForm from '../../languageForm';

interface Props {
  params: { id?: string };
}

const EditLanguagePage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<Partial<LanguageType>>({});
  const isEditMode = Boolean(params.id);

  useEffect(() => {
    if (!params.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data } = await getLanguageById(params.id);
        const language = Array.isArray(data) ? data[0] : data;
        if (language?._id) {
          setDefaultValues(language);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const onSubmitHandler = async (data: Omit<LanguageType, '_id'>) => {
    try {
      // await updateLanguage(params.id as string, data)
      router.push('/languages');
    } catch {
      console.error('Error updating language');
    }
  };

  if (loading) return <div>Loading language details...</div>;

  return (
    <LanguageForm defaultValues={defaultValues} isEditMode onSubmitHandler={onSubmitHandler} />
  );
};

export default EditLanguagePage;
