import FileUpload from '@/components/FileUpload';
import PageTitle from '@/components/PageTitle';
import CustomerAddCard from './components/PaitentAddCard';
import AddCustomer from './components/AddPaitent';
import { Col, Row } from 'react-bootstrap';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Customers Add' };

const CustomerAddPage = () => {
  return (
    <>
      <PageTitle title="Add Enquiry" subName="" />
      <AddCustomer params={{}} />
    </>
  );
};

export default CustomerAddPage;
