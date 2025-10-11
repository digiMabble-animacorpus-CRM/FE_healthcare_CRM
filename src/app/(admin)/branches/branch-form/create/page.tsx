'use client';

import { useRouter } from 'next/navigation';
import BranchForm, { BranchFormValues } from '../branchForm';
import { API_BASE_PATH } from '@/context/constants';
import { useNotificationContext } from '@/context/useNotificationContext';
import axios from 'axios';

const CreateBranchPage = () => {
  const router = useRouter();
  const { showNotification } = useNotificationContext();

  const onSubmitHandler = async (data: BranchFormValues) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE_PATH}/branches`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showNotification({
        message: 'Succursale ajoutée avec succès !',
        variant: 'success',
      });

      setTimeout(() => {
        router.push('/branches');
      }, 500); // Wait 500ms before redirecting
    } catch (error) {
      showNotification({
        message: "Échec de l'ajout de la succursale.",
        variant: 'danger',
      });
    }
  };

  return <BranchForm onSubmitHandler={onSubmitHandler} />;
};

export default CreateBranchPage;
