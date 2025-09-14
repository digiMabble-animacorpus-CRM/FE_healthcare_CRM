'use client';
import logoDark from '@/assets/images/logo-dark.png';
import LogoLight from '@/assets/images/logo-light.png';
import TextFormInput from '@/components/from/TextFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import useSignup from './useSignup';

const SignUp = () => {
  useEffect(() => {
    document.body.classList.add('authentication-bg');
    return () => {
      document.body.classList.remove('authentication-bg');
    };
  }, []);

  const messageSchema = yup.object({
    name: yup.string().required('Please enter Name'),
    email: yup.string().email().required('Please enter E-mail'),
    password: yup.string().required('Please enter password'),
  });

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(messageSchema),
  });
  const { signup } = useSignup();

  return (
    <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5">
      <Container>
        <Row className="justify-content-center">
          <Col xl={5}>
            <Card className="auth-card">
              <CardBody className="px-3 py-5">
                <div className="mx-auto mb-4 text-center auth-logo">
                  <Link href="/dashboards/agent" className="logo-dark">
                    <Image src={logoDark} height={32} alt="logo dark" />
                  </Link>
                  <Link href="/dashboards/agent" className="logo-light">
                    <Image src={LogoLight} height={28} alt="logo light" />
                  </Link>
                </div>
                <h2 className="fw-bold text-uppercase text-center fs-18">Compte gratuit</h2>
                <p className="text-muted text-center mt-1 mb-4">
                  Nouveau sur notre plateforme ? Inscrivez-vous dès maintenant! Cela ne prend qu une
                  minute.
                </p>
                <div className="px-4">
                  <form
                    onSubmit={handleSubmit((data) => {
                      console.log('🚀 Submitting form with:', data);
                      signup(data);
                    })}
                    className="authentication-form"
                  >
                    <div className="mb-3">
                      <TextFormInput
                        control={control}
                        name="name"
                        placeholder="Entrez votre nom"
                        className="bg-light bg-opacity-50 border-light py-2"
                        label="Nom"
                      />
                    </div>
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
                        <input type="checkbox" className="form-check-input" id="checkbox-signin" />
                        <label className="form-check-label" htmlFor="checkbox-signin">
                          J accepte les termes et conditions
                        </label>
                      </div>
                    </div>
                    <div className="mb-1 text-center d-grid">
                      <button className="btn btn-danger py-2" type="submit">
                        Créer un compte
                      </button>
                    </div>
                  </form>
                  {/* <p className="mt-3 fw-semibold no-span">OR sign with</p> */}
                  {/* <div className="text-center">
                    <Button variant="outline-light" className="shadow-none">
                      <IconifyIcon icon="bxl:google" className="fs-20" />
                    </Button>
                    &nbsp;
                    <Button variant="outline-light" className="shadow-none">
                      <IconifyIcon icon="ri:facebook-fill" height={32} width={20} className="" />
                    </Button>
                    &nbsp;
                    <Button variant="outline-light" className="shadow-none">
                      <IconifyIcon icon="bxl:github" className="fs-20" />
                    </Button>
                  </div> */}
                </div>
              </CardBody>
            </Card>
            <p className="mb-0 text-center text-white">
              J ai déjà un compte{' '}
              <Link href="/auth/sign-in" className="text-reset text-unline-dashed fw-bold ms-1">
                Se connecter
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignUp;
