import properties11 from "@/assets/images/properties/p-11.jpg";
import properties13 from "@/assets/images/properties/p-13.jpg";
import properties14 from "@/assets/images/properties/p-14.jpg";
import properties15 from "@/assets/images/properties/p-15.jpg";
import avatar2 from "@/assets/images/users/avatar-2.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Carousel,
  CarouselItem,
  Col,
  Row,
} from "react-bootstrap";

const CustomersDetails = () => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mt-3">
          <div className="d-flex align-items-center gap-3">
            <Image
              src={avatar2}
              alt="avatar"
              className="rounded-circle avatar-xl img-thumbnail"
            />
            <div>
              <h3 className="fw-semibold mb-1">Daavid Nummi</h3>
              <p className="link-primary fw-medium fs-14">
                Dob | Gender
              </p>
            </div>
          </div>
          <div className="d-flex gap-1">
            <Button
              variant="dark"
              className="avatar-sm d-flex align-items-center justify-content-center fs-20"
            >
              <span>
                {" "}
                <IconifyIcon icon="ri:edit-fill" />
              </span>
            </Button>
            <Button
              variant="primary"
              className="avatar-sm d-flex align-items-center justify-content-center fs-20"
            >
              <span>
                {" "}
                <IconifyIcon icon="ri:share-fill" />
              </span>
            </Button>
          </div>
        </div>
        <Row className="my-4">
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Email Address :</p>
            <p className="mb-0">daavidnumminen@teleworm.be</p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Phone Number :</p>
            <p className="mb-0">+32 06-75820711</p>
          </Col>
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Location :</p>
            <p className="mb-0">Schoolstraat 161 5151 HH Drunen </p>
          </Col>
          <Col lg={2}>
            <p className="text-dark fw-semibold fs-16 mb-1">Status :</p>
            <p className="mb-0">
              <span className="badge bg-success text-white fs-12 px-2 py-1">
                Available
              </span>{" "}
            </p>
          </Col>
        </Row>
        <Row className="my-4">
          <Col lg={12}>
            <CardTitle as={"h4"} className="mb-2">
              Address :
            </CardTitle>
            <p className="mb-0">
              <IconifyIcon
                icon="ri:circle-fill"
                className="fs-10 me-2 text-success"
              />{" "}
              3-4 bedrooms, 2-3 bathrooms
            </p>
            <p className="mb-0">
              <IconifyIcon
                icon="ri:circle-fill"
                className="fs-10 me-2 text-success"
              />{" "}
              Close to public transportation, good school district, backyard,
              modern kitchen
            </p>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <CardTitle as={"h4"} className="mb-2">
              Tags :
            </CardTitle>
            <div className="d-flex gap-2">
              <p className="mb-0">
                <IconifyIcon
                  icon="ri:circle-fill"
                  className="fs-10 me-2 text-success"
                />{" "}
                3-4 bedrooms, 2-3 bathrooms
              </p>
              <p className="mb-0">
                <IconifyIcon
                  icon="ri:circle-fill"
                  className="fs-10 me-2 text-success"
                />{" "}
                Close to public transportation, good school district, backyard,
                modern kitchen
              </p>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default CustomersDetails;
