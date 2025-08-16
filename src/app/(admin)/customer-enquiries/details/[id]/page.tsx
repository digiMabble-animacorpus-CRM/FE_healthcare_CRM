import PageTitle from "@/components/PageTitle";
import { getCustomerEnquiriesById } from "@/helpers/data";
import CustomersDetails from "./components/CustomersDetails";
import WeeklyInquiry from "./components/WeeklyInquiry";
import TransactionHistory from "./components/TransactionHistory";
import type { CustomerEnquiriesType } from "@/types/data";
import { Col, Row, Container } from "react-bootstrap";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Customer Overview" };

interface Props {
  params: { id: string };
}

const CustomerDetailsPage = async ({ params }: Props) => {
  const patientId = params.id;
  const response = await getCustomerEnquiriesById(patientId);
  const customers: CustomerEnquiriesType[] = response.data ?? [];

  return (
    <Container className="py-4">
      <PageTitle subName="Customers" title="Customer Overview" />
      <Row>
        <Col xl={8} lg={12}>
          {customers.length > 0 ? (
            <CustomersDetails data={customers[0]} />
          ) : (
            <p>No customer found.</p>
          )}
        </Col>
        <Col xl={4} lg={12}>
          <WeeklyInquiry />
        </Col>
      </Row>
      <TransactionHistory />
    </Container>
  );
};

export default CustomerDetailsPage;
