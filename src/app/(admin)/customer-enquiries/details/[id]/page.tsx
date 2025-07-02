import PageTitle from "@/components/PageTitle";
import { getAllProperty, getPatientById } from "@/helpers/data";
import CustomersDetails from "./components/CustomersDetails";
import WeeklyInquiry from "./components/WeeklyInquiry";
import TransactionHistory from "./components/TransactionHistory";
import type { PatientType } from "@/types/data";
import { Col, Row } from "react-bootstrap";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Customer Overview" };

interface Props {
  params: { id: string };
}

const CustomerDetailsPage = async ({ params }: Props) => {
  const patientId = params.id;
  const propertyData = await getAllProperty();
  const response = await getPatientById(patientId);
  const patients: PatientType[] = response.data;

  return (
    <>
      <PageTitle subName="Customers" title="Customer Overview" />
      <Row>
        <Col xl={8} lg={12}>
          <CustomersDetails data={patients[0]} />
        </Col>
        <Col xl={4} lg={12}>
          <WeeklyInquiry />
        </Col>
      </Row>
      <TransactionHistory />
    </>
  );
};

export default CustomerDetailsPage;
