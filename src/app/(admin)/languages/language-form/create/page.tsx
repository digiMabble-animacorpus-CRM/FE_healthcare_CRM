'use client';

import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import type { LanguageType } from '@/types/data';
import LanguageForm from '../languageForm';

const CreateLanguagePage = () => {
  const router = useRouter();

  const handleCreate = async (data: Omit<LanguageType, '_id'>) => {
    try {
      // await createLanguageAPI(data);

      toast.success('Language created successfully!');
      router.push('/languages');
    } catch (error) {
      toast.error('Failed to create Language.');
    }
  };

  return <LanguageForm onSubmitHandler={handleCreate} />;
};

export default CreateLanguagePage;
