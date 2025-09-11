'use client';
import logoDark from '@/assets/images/logo-light2.png';
import LogoLight from '@/assets/images/logo-light2.png';
import TextFormInput from '@/components/from/TextFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import useResetPassword from './useResetPassword';
import { useSearchParams } from 'next/navigation';

const ResetPassword = () => {
  useEffect(() => {
    document.body.classList.add('authentication-bg');
    return () => {
      document.body.classList.remove('authentication-bg');
    };
  }, []);

  type ForgotPasswordFormData = {
    email: string;
  };

  type ResetPasswordFormData = {
    password: string;
    confirmPassword: string;
  };

  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const forgotPasswordSchema = yup.object({
    email: yup.string().email().required('Please enter your email'),
  });

  const resetPasswordSchema = yup.object({
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .required('Please enter new password'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const schema = token ? resetPasswordSchema : forgotPasswordSchema;

  const { handleSubmit, control } = useForm<ForgotPasswordFormData | ResetPasswordFormData>({
    resolver: yupResolver(schema as any),
  });

  const { resetPassword, requestResetLink, loading } = useResetPassword();

  const onSubmit = (data: any) => {
    if (token) {
      resetPassword(token, data.password, data.confirmPassword);
    } else {
      requestResetLink(data.email);
    }
  };

  return (
    <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5">
      <Container>
        <Row className="justify-content-center">
          <Col xl={5}>
            <Card className="auth-card">
              <CardBody className="px-3 py-5">
                <div className="mx-auto mb-4 text-center auth-logo">
                  <Link href="/dashboards/agent" className="logo-dark">
                    <Image src={logoDark} height={72} alt="logo dark" />
                  </Link>
                  <Link href="/dashboards/agent" className="logo-light">
                    <Image src={LogoLight} height={28} alt="logo light" />
                  </Link>
                </div>
                <h2 className="fw-bold text-uppercase text-center fs-18">Reset Password</h2>
                <p className="text-muted text-center mt-1 mb-4">
                  {token
                    ? 'Enter your new password to reset your account.'
                    : 'Enter your email address and we’ll send you an email with instructions to reset your password.'}
                </p>
                <div className="px-4 mb-5">
                  <form onSubmit={handleSubmit(onSubmit)} className="authentication-form">
                    <div className="mb-3">
                      {token ? (
                        <>
                          <TextFormInput
                            control={control}
                            name="password"
                            type="password"
                            label="New Password"
                            placeholder="Enter new password"
                            className="bg-light bg-opacity-50 border-light py-2"
                          />
                          <TextFormInput
                            control={control}
                            name="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            placeholder="Re-enter new password"
                            className="bg-light bg-opacity-50 border-light py-2"
                          />
                        </>
                      ) : (
                        <TextFormInput
                          control={control}
                          name="email"
                          type="email"
                          label="Email"
                          placeholder="Enter your email"
                          className="bg-light bg-opacity-50 border-light py-2"
                        />
                      )}
                    </div>
                    <div className="mb-1 text-center d-grid">
                      <button
                        disabled={loading}
                        className="btn btn-danger py-2 fw-medium"
                        type="submit"
                      >
                        {token ? 'Set New Password' : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                </div>
                <p className="mb-0 text-center">
                  Back to{' '}
                  <Link href="/auth/sign-in" className="text-reset text-unline-dashed fw-bold ms-1">
                    Sign In
                  </Link>
                </p>
              </CardBody>
              
            </Card>
            
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword;
