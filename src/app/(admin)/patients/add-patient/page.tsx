import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import CustomerAddCard from './components/PaitentAddCard';
import AddPatient from './components/AddPaitent';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customers Add' };

const CustomerAddPage = () => {
  return (
    <>
      <PageTitle title="Add Patient" subName="" />
      <AddPatient params={{}} />
    </>
  );
};

export default CustomerAddPage;
