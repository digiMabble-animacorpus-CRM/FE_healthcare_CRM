import React from 'react';
import SignIn from './components/SignIn';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Se connecter' };

const SignInPage = () => {
  return <SignIn />;
};

export default SignInPage;
