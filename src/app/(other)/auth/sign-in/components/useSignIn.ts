'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { API_BASE_PATH } from '@/context/constants';
import { useNotificationContext } from '@/context/useNotificationContext';
import useQueryParams from '@/hooks/useQueryParams';
import { encryptAES } from '@/utils/encryption';

const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { push } = useRouter();
  const { showNotification } = useNotificationContext();
  const queryParams = useQueryParams();

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  });

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const remembered = JSON.parse(localStorage.getItem('checkbox-signin') || '{}');
    if (remembered?.email) setValue('email', remembered.email);
    if (remembered?.password) setValue('password', remembered.password);

    const checkbox = document.getElementById('checkbox-signin') as HTMLInputElement;
    if (checkbox && remembered?.email) {
      checkbox.checked = true;
    }
  }, [setValue]);

  type LoginFormFields = yup.InferType<typeof loginFormSchema>;

  const login = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true);

    const encryptedData = encryptAES({
      email_id: values.email,
      password: values.password,
    });

    try {
      const res = await fetch(`${API_BASE_PATH}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: encryptedData }),
      });

      const data = await res.json();

      if (res.ok && data.status && data.data?.accessToken) {
        const rosaToken = await fetch(`${API_BASE_PATH}/rosa-token`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const rosaData = await rosaToken.json();
        localStorage.setItem('access_token', data.data.accessToken);
        localStorage.setItem('rosa_token', rosaData.rosaToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        const rememberMe = document.getElementById('checkbox-signin') as HTMLInputElement;
        if (rememberMe?.checked) {
          localStorage.setItem(
            'checkbox-signin',
            JSON.stringify({ email: values.email, password: values.password }),
          );
        } else {
          localStorage.removeItem('checkbox-signin');
        }

        //  Unified dashboard redirection
        push('/dashboards/agent');

        showNotification({ message: 'Bienvenue chez Anima Corpus CRM', variant: 'success' });
      } else {
        showNotification({ message: data.message || 'Identifiants invalides', variant: 'danger' });
      }
    } catch (err) {
      showNotification({
        message: 'Une erreur sest produite lors de la connexion',
        variant: 'danger',
      });
    }

    setLoading(false);
  });

  return { loading, login, control };
};

export default useSignIn;
