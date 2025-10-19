'use client';

import { API_BASE_PATH } from '@/context/constants';
import { useNotificationContext } from '@/context/useNotificationContext';
import { useRouter } from 'next/navigation';
import LanguageForm, { LanguageFormValues } from '../languageForm';

const CreateLanguagePage = () => {
  const router = useRouter();
const { showNotification } = useNotificationContext();
  const handleCreate = async (data: LanguageFormValues) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        showNotification({
          message: 'No access token found!',
          variant: 'danger',
        });
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
showNotification({
        message: 'Langue créée avec succès !',
        variant: 'success',
      });

      setTimeout(() => {
        router.push('/languages');
      }, 500);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Échec de la création de la langue.",
        variant: 'danger',
      });
    }
  };

  return <LanguageForm onSubmitHandler={handleCreate} />;
};

export default CreateLanguagePage;
