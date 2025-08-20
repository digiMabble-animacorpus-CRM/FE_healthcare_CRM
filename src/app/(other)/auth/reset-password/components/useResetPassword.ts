'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_PATH } from '@/context/constants';
import { useNotificationContext } from '@/context/useNotificationContext';

const useResetPassword = () => {
  const { push } = useRouter();
  const { showNotification } = useNotificationContext();
  const [loading, setLoading] = useState(false);

  const requestResetLink = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_PATH}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_id: email }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        showNotification({ message: 'Check your email for the reset link.', variant: 'success' });
      } else {
        showNotification({ message: data.message || 'Failed to send email.', variant: 'danger' });
      }
    } catch (error) {
      showNotification({ message: 'Something went wrong.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    if (!token) {
      showNotification({ message: 'Missing or invalid token.', variant: 'danger' });
      return;
    }

    if (password !== confirmPassword) {
      showNotification({ message: 'Passwords do not match.', variant: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_PATH}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: password }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        showNotification({ message: 'Password reset successful.', variant: 'success' });
        push('/auth/sign-in');
      } else {
        showNotification({ message: data.message || 'Reset failed.', variant: 'danger' });
      }
    } catch (err) {
      showNotification({ message: 'Error occurred. Try again.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, requestResetLink, loading };
};

export default useResetPassword;
