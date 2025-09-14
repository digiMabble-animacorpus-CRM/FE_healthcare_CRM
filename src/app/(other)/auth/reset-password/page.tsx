import { Metadata } from 'next';
import ResetPassword from './components/ResetPassword';

export const metadata: Metadata = { title: 'Réinitialiser le mot de passe' };

const ResetPasswordPage = () => {
  return <ResetPassword />;
};

export default ResetPasswordPage;
