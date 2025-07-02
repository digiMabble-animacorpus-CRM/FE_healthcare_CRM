import FileUpload from "@/components/FileUpload";
import PageTitle from "@/components/PageTitle";
import AddCustomer from "../../add-enquiry/components/AddCustomer";
import { Col, Row } from "react-bootstrap";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Customers Add" };

const CustomerEditPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTitle title="Edit Customer" subName="" />
      <AddCustomer params={params} />
    </>
  );
};

export default CustomerEditPage;
