// useSignup.ts
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_PATH } from '@/context/constants';
import { useNotificationContext } from '@/context/useNotificationContext';
import * as yup from 'yup';
import { encryptAES } from '@/utils/encryption';

export const signupSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email().required('E-mail is required'),
  password: yup.string().required('Password is required'),
});

export type SignupFormFields = yup.InferType<typeof signupSchema>;

const useSignup = () => {
  const { push } = useRouter();
  const { showNotification } = useNotificationContext();
  const [loading, setLoading] = useState(false);

  const signup = async (formData: SignupFormFields) => {
    setLoading(true);

    // Encrypt the payload
    const encryptedPayload = encryptAES({
      name: formData.name,
      email_id: formData.email,
      password: formData.password,
    });
    try {
      const res = await fetch(`${API_BASE_PATH}/auth/signup-super-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: encryptedPayload }),
      });

      const data = await res.json();

      if (res.ok && data.status) {
        localStorage.setItem('email_id', formData.email);
        showNotification({ message: 'Signup successful! Please login.', variant: 'success' });
        push('/auth/sign-in');
      } else {
        showNotification({ message: data.message || 'Signup failed', variant: 'danger' });
      }
    } catch (err) {
      console.error(' Error during signup:', err);
      showNotification({ message: 'Error during signup', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading };
};

export default useSignup;
