'use client';
import { default as logoDark, default as LogoLight } from '@/assets/images/logo-light2.png';
import TextFormInput from '@/components/from/TextFormInput';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import useSignIn from './useSignIn';

const SignIn = () => {
  useEffect(() => {
    document.body.classList.add('authentication-bg');
    return () => {
      document.body.classList.remove('authentication-bg');
    };
  }, []);

  const { loading, login, control } = useSignIn();
  return (
    <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5">
      <Container>
        <Row className="justify-content-center">
          <Col xl={5}>
            <Card className="auth-card">
              <CardBody className="px-3 py-5">
                <div className="mx-auto mb-4 text-center auth-logo">
                  <Link href="/appointment-calender" className="logo-dark">
                    <Image src={logoDark} height={82} alt="logo dark" />
                  </Link>
                  <Link href="/appointment-calender" className="logo-light">
                    <Image src={LogoLight} height={28} alt="logo light" />
                  </Link>
                </div>
                <h2 className="fw-bold text-uppercase text-center fs-18">Se connecter</h2>
                <p className="text-muted text-center mt-1 mb-4">
                  Entrez votre adresse e-mail et votre mot de passe pour accéder au panneau d
                  administration.
                </p>
                <div className="px-4">
                  <form className="authentication-form" onSubmit={login}>
                    <div className="mb-3">
                      <TextFormInput
                        control={control}
                        name="email"
                        placeholder="Entrez votre email"
                        className="bg-light bg-opacity-50 border-light py-2"
                        label="E-mail"
                      />
                    </div>
                    <div className="mb-3">
                      <TextFormInput
                        control={control}
                        name="password"
                        placeholder="Entrez votre mot de passe"
                        className="bg-light bg-opacity-50 border-light py-2"
                        label="Mot de passe"
                      />
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <Link
                          href="/auth/reset-password"
                          className="float-end text-muted text-unline-dashed ms-1"
                        >
                          Réinitialiser le mot de passe
                        </Link>
                      </div>
                    </div>
                    <div className="mb-1 text-center d-grid">
                      <button
                        disabled={loading}
                        className="btn btn-primary py-2 fw-medium"
                        type="submit"
                      >
                        Se connecter
                      </button>
                    </div>
                  </form>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignIn;
