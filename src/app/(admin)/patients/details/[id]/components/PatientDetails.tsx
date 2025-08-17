'use client';

import avatar2 from '@/assets/images/users/avatar-2.jpg';
import patientBannerImg from '@/assets/images/properties/p-12.jpg';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Table, Button } from 'react-bootstrap';

type WeeklyInquiryType = { week: string; inquiries: number };
type TransactionStatType = {
  title: string;
  count: number;
  progress: number;
  icon: string;
  variant: string;
};
type TransactionHistoryType = { date: string; type: string; amount: number; status: string };
type FeedbackType = {
  name: string;
  userName: string;
  country: string;
  day: number;
  description: string;
  rating: number;
  image?: string;
};
type FileType = { name: string; size: number; icon: string; variant: string };

type PatientDetailsCardProps = {
  name: string;
  birthdate: string;
  gender?: string;
  email?: string;
  phones?: string[];
  address?: string;
  city?: string;
  country?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  note?: string;
  weeklyInquiry?: WeeklyInquiryType[];
  transactionStats?: TransactionStatType[];
  transactionHistory?: TransactionHistoryType[];
  feedbacks?: FeedbackType[];
  files?: FileType[];
};

const PatientDetails = ({
  name,
  birthdate,
  gender,
  email,
  phones,
  address,
  city,
  country,
  status = 'ACTIVE',
  note,
  weeklyInquiry = [],
  transactionStats = [],
  transactionHistory = [],
  feedbacks = [],
  files = [],
}: PatientDetailsCardProps) => {
  const router = useRouter();
  const handleEditClick = (id: string) => {
    router.push(`/patients/edit-patient/${id}`);
  };

  return (
    <div>
      {/* Top Buttons */}
      <div className="d-flex justify-content-between mb-3 gap-2 flex-wrap">
        <Button variant="outline-secondary" onClick={() => router.push('/patients/patient-list')}>
          <IconifyIcon icon="ri:arrow-left-line" /> Back to List
        </Button>
        <Button variant="primary" onClick={() => alert('Book Appointment clicked!')}>
          <IconifyIcon icon="ri:calendar-event-line" /> Book Appointment
        </Button>
      </div>

      {/* Banner */}
      <Card className="mb-4">
        <CardBody className="p-0">
          <Image src={patientBannerImg} alt="banner" className="img-fluid rounded-top" />
        </CardBody>
      </Card>

      {/* Profile / Avatar / Contact / Status / Action Buttons */}
      <Card className="mb-4">
        <CardBody>
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mt-3">
            <div className="d-flex align-items-center gap-3">
              <Image
                src={avatar2}
                alt="avatar"
                priority
                className="rounded-circle avatar-xl img-thumbnail"
              />
              <div>
                <h3 className="fw-semibold mb-1">{name}</h3>
                <p className="link-primary fw-medium fs-14">
                  {birthdate} {gender ? `| ${gender}` : ''}
                </p>
              </div>
            </div>
            <div className="d-flex gap-1">
              <Button
                variant="dark"
                className="avatar-sm d-flex align-items-center justify-content-center fs-20"
                onClick={() => handleEditClick(data?.id)}
              >
                <span>
                  {' '}
                  <IconifyIcon icon="ri:edit-fill" />
                </span>
              </Button>
            </div>
          </div>

          <Row className="my-4">
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Email Address :</p>
              <p className="mb-0">{email || '-'}</p>
            </Col>
            <Col lg={3}>
              <p className="text-dark fw-semibold fs-16 mb-1">Phone Number :</p>
              <p className="mb-0">{phones?.join(', ') || '-'}</p>
            </Col>
            <Col lg={3}>
              <p className="text-dark fw-semibold fs-16 mb-1">City :</p>
              <p className="mb-0">{city || '-'}</p>
            </Col>
            <Col lg={2}>
              <p className="text-dark fw-semibold fs-16 mb-1">Status :</p>
              <span
                className={`badge bg-${status === 'ACTIVE' ? 'success' : 'danger'} text-white fs-12 px-2 py-1`}
              >
                {status}
              </span>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={9}>
              <p className="text-dark fw-semibold fs-16 mb-1">Address :</p>
              <p className="mb-0">{[address, city, country].filter(Boolean).join(', ') || '-'}</p>
            </Col>
            <Col lg={3}>
              <p className="text-dark fw-semibold fs-16 mb-1">Mode of Register :</p>
              <p className="mb-0">Online</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="text-dark fw-semibold fs-16 mb-1">Description / Notes :</p>
              <p className="mb-0">{note || '-'}</p>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Weekly Inquiry & Transactions */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle as={'h4'} className="mb-3">
            Weekly Inquiry & Transactions
          </CardTitle>
          <Row className="g-3">
            {weeklyInquiry.map((w, idx) => {
              const options = {
                series: [w.inquiries],
                chart: { type: 'radialBar' as const, height: 90, sparkline: { enabled: true } },
                plotOptions: {
                  radialBar: { hollow: { size: '50%' }, dataLabels: { show: false } },
                },
                colors: ['#0d6efd'],
              };
              return (
                <Col lg={4} key={idx}>
                  <Card className="border p-3">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="avatar bg-primary bg-opacity-10 rounded flex-centered">
                        <IconifyIcon
                          icon="ri:calendar-line"
                          width={28}
                          height={28}
                          className="fs-28 text-primary"
                        />
                      </div>
                      <div>
                        <p className="fw-medium fs-15 mb-1">{w.week}</p>
                        <p className="fw-semibold fs-20 mb-0">{w.inquiries}</p>
                      </div>
                    </div>
                    <ReactApexChart
                      options={options}
                      series={options.series}
                      type="radialBar"
                      height={90}
                    />
                  </Card>
                </Col>
              );
            })}

            {transactionStats.map((t, idx) => {
              const options = {
                series: [t.progress],
                chart: { type: 'radialBar' as const, height: 90, sparkline: { enabled: true } },
                plotOptions: {
                  radialBar: { hollow: { size: '50%' }, dataLabels: { show: false } },
                },
                colors: [t.variant],
              };
              return (
                <Col lg={4} key={idx}>
                  <Card className="border p-3">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className={`avatar bg-${t.variant} bg-opacity-10 rounded flex-centered`}>
                        <IconifyIcon
                          icon={t.icon}
                          width={28}
                          height={28}
                          className={`fs-28 text-${t.variant}`}
                        />
                      </div>
                      <div>
                        <p className="fw-medium fs-15 mb-1">{t.title}</p>
                        <p className="fw-semibold fs-20 mb-0">{t.count}</p>
                      </div>
                    </div>
                    <ReactApexChart
                      options={options}
                      series={options.series}
                      type="radialBar"
                      height={90}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </CardBody>
      </Card>

      {/* Transaction History Table */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle as={'h4'} className="mb-3">
            Transaction History
          </CardTitle>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactionHistory.map((tr, idx) => (
                <tr key={idx}>
                  <td>{tr.date}</td>
                  <td>{tr.type}</td>
                  <td>${tr.amount.toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge bg-${tr.status === 'Completed' ? 'success' : tr.status === 'Pending' ? 'warning' : 'danger'} text-white`}
                    >
                      {tr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Reviews / Feedback */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle as={'h4'} className="mb-3">
            Reviews / Feedback
          </CardTitle>
          <Row>
            {feedbacks.map((f, idx) => (
              <Col lg={6} key={idx}>
                <Card className="bg-light-subtle mb-3">
                  <CardBody>
                    <div className="d-flex align-items-center gap-2">
                      {f.image && (
                        <Image src={f.image} alt="avatar" className="rounded-circle avatar-md" />
                      )}
                      <div>
                        <h5 className="fw-semibold mb-1">{f.name}</h5>
                        <p className="m-0">
                          @{f.userName} <span className="ms-1">({f.country})</span>
                        </p>
                      </div>
                    </div>
                    <p className="my-3">&quot;{f.description}&quot;</p>
                    <ul className="d-flex text-warning m-0 fs-18 list-unstyled">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i}>
                          <IconifyIcon icon={i < f.rating ? 'ri:star-fill' : 'ri:star-line'} />
                        </li>
                      ))}
                    </ul>
                    <p className="fw-medium text-muted mb-0">{f.day} Days Ago</p>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>

      {/* Files / Documents */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle as={'h4'} className="mb-3">
            Files / Documents
          </CardTitle>
          <div className="d-flex flex-wrap gap-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="d-flex p-2 gap-2 bg-light-subtle align-items-center border rounded position-relative"
              >
                <IconifyIcon icon={file.icon} className={`text-${file.variant} fs-24`} />
                <div>
                  <h4 className="fs-14 mb-1">
                    <Link href="#" className="text-dark stretched-link">
                      {file.name}
                    </Link>
                  </h4>
                  <p className="fs-12 mb-0">{file.size} MB</p>
                </div>
                <IconifyIcon icon="ri:download-cloud-line" className="fs-20 text-muted" />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PatientDetails;
