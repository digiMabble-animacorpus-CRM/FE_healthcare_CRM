import PageTitle from "@/components/PageTitle";
import { getAllProperty } from "@/helpers/data";
import WeeklyInquiry from "./components/WeeklyInquiry";
import TransactionHistory from "./components/TransactionHistory";
import type { StaffType, TherapistType } from "@/types/data";
import { Col, Row } from "react-bootstrap";
import { Metadata } from "next";
import StaffDetails from "./components/StaffDetails";
import { getStaffById } from "@/helpers/staff";

export const metadata: Metadata = { title: "Staff Overview" };

interface Props {
  params: { id: string };
}

const StaffDetailPage = async ({ params }: Props) => {
  const staffId = params.id;
  const propertyData = await getAllProperty();
  const response = await getStaffById(staffId);
  const staffs: StaffType[] = response.data;

  return (
    <>
      <PageTitle subName="Staffs" title="Staff Overview" />
      <Row>
        <Col xl={8} lg={12}>
          <StaffDetails data={staffs[0]} />
        </Col>
        <Col xl={4} lg={12}>
          <WeeklyInquiry />
        </Col>
      </Row>
      <TransactionHistory />
    </>
  );
};

export default StaffDetailPage;
