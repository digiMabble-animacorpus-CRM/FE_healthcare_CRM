'use client';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import type { TherapistShortType } from '@/types/data';
import { FaEnvelope, FaPhone } from 'react-icons/fa';

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

export type PatientDetailsCardProps = {
  id?: string;
  name: string;
  birthdate: string;
  gender?: string;
  email?: string;
  phones?: string[];
  address?: string;
  city?: string;
  country?: string;
  zipcode?: string;
  language?: { id: number; language_name: string; language_description?: string } | null;

  ssin?: string;
  mutualitynumber?: string;
  mutualityregistrationnumber?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  note?: string;
  weeklyInquiry?: WeeklyInquiryType[];
  transactionStats?: TransactionStatType[];
  transactionHistory?: TransactionHistoryType[];
  feedbacks?: FeedbackType[];
  files?: FileType[];

  // 🔥 Added therapist
  therapist?: TherapistShortType | null;

  departmentsMap?: Record<number, string>; // optional mapping of deptId -> name
  specializationsMap?: Record<number, string>; // optional mapping of specId -> name
};

const PatientDetails = ({
  id,
  name,
  birthdate,
  gender,
  email,
  phones,
  address,
  city,
  country,
  zipcode,
  language,
  ssin,
  mutualitynumber,
  mutualityregistrationnumber,
  status = 'ACTIVE',
  note,
  weeklyInquiry = [],
  transactionStats = [],
  transactionHistory = [],
  feedbacks = [],
  files = [],
  therapist,
  departmentsMap = {},
  specializationsMap = {},
}: PatientDetailsCardProps) => {
  const router = useRouter();
  const handleEditClick = (id: any) => {
    router.push(`/patients/edit-patient/${id}`);
  };

  return (
    <div>
      {/* Top Buttons */}
      <div className="d-flex justify-content-between mb-3 gap-2 flex-wrap">
        <Button variant="link" onClick={() => router.push('/patients/patient-list')}>
          <IconifyIcon icon="ri:arrow-left-line" />
          Retour à la liste
        </Button>
        <Button variant="primary">
          <IconifyIcon icon="ri:calendar-event-line" />
          Prendre rendez-vous
        </Button>
      </div>

      {/* Profile Section */}
      <Card className="mb-4 shadow-lg">
        <CardBody>
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mt-3">
            <div className="d-flex align-items-center gap-3">
              {/* Initial instead of image */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#0d6efd',
                  color: '#fff',
                  fontSize: '36px',
                  fontWeight: 'bold',
                }}
              >
                {name ? name[0].toUpperCase() : 'T'}
              </div>
              <div>
                <h3 className="fw-semibold mb-1">{name}</h3>
                <p className="link-primary fw-medium fs-14">
                  {birthdate}
                  {gender ? ` | ${gender}` : ''}
                </p>
              </div>
            </div>
            <div className="d-flex gap-1">
              <Button
                variant="secondary"
                className="avatar-sm d-flex align-items-center justify-content-center fs-20"
                onClick={() => handleEditClick(id)}
              >
                <span>
                  <IconifyIcon icon="ri:edit-fill" />
                </span>
              </Button>
            </div>
          </div>

          {/* Contact & Info */}
          <Row className="my-4 g-3">
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Adresse email:</p>
              <p className="mb-0">{email || 'N/A'}</p>
            </Col>
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Numéro de téléphone:</p>
              <p className="mb-0">{phones?.join(', ') || 'N/A'}</p>
            </Col>
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Ville:</p>
              <p className="mb-0">{city || 'N/A'}</p>
            </Col>
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Pays:</p>
              <p className="mb-0">{country || 'N/A'}</p>
            </Col>
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Code postal:</p>
              <p className="mb-0">{zipcode || 'N/A'}</p>
            </Col>
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Langue:</p>
              <p className="mb-0"> {language ? language.language_name : 'N/A'}</p>
            </Col>
          </Row>

          {/* IDs & Status */}
          <Row className="my-4 g-3">
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">SSIN:</p>
              <p className="mb-0">{ssin || 'N/A'}</p>
            </Col>
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Adresse:</p>
              <p className="mb-0">{[address, city, country].filter(Boolean).join(', ') || 'N/A'}</p>
            </Col>
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Description/Remarques:</p>
              <p className="mb-0">{note || 'N/A'}</p>
            </Col>
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Statut:</p>
              <span
                className={`badge bg-${status === 'ACTIVE' ? 'success' : 'danger'} text-white fs-12 px-2 py-1`}
              >
                {status}
              </span>
            </Col>
          </Row>

          {/* Address & Notes */}
          <Row className="my-4 g-3">
            <Col lg={8}>
              <p className="text-dark fw-semibold fs-16 mb-1">Numéro de Mutualité:</p>
              <p className="mb-0">{mutualitynumber || 'N/A'}</p>
            </Col>
            <Col lg={4}>
              <p className="text-dark fw-semibold fs-16 mb-1">Mode d enregistrement:</p>
              <p className="mb-0">Online</p>
            </Col>
            <Col lg={12}>
              <p className="text-dark fw-semibold fs-16 mb-1">Numéro de carte de résident:</p>
              <p className="mb-0">{mutualityregistrationnumber || 'N/A'}</p>
            </Col>
          </Row>

          {/* 🔥 Therapist Section */}
          {therapist && (
            <Row className="my-4 g-3">
              <Col lg={12}>
                <h5 className="text-dark fw-semibold fs-16 mb-2">Thérapeute assigné</h5>
                <Card className="border p-3">
                  <div className="d-flex align-items-center gap-3">
                    {therapist.imageUrl ? (
                      <img
                        src={therapist.imageUrl}
                        alt={therapist.fullName || 'NA'}
                        className="rounded-circle"
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: '#6f42c1',
                          color: '#fff',
                          fontSize: '20px',
                          fontWeight: 'bold',
                        }}
                      >
                        {therapist.fullName ? therapist.fullName[0].toUpperCase() : 'T'}
                      </div>
                    )}
                    <div>
                      <h6 className="mb-1">{therapist.fullName || 'NA'}</h6>
                      {therapist.contactEmail && (
                        <p className="mb-0">
                          <FaEnvelope className="me-1 text-primary" />{' '}
                          {therapist.contactEmail || 'NA'}
                        </p>
                      )}
                      {therapist.contactPhone && (
                        <p className="mb-0">
                          <FaPhone className="me-1 text-success" /> {therapist.contactPhone || 'NA'}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default PatientDetails;

//       {/* Weekly Inquiry & Transactions */}
//       <Card className="mb-4">
//         <CardBody>
//           <CardTitle as={'h4'} className="mb-3">
//             Weekly Inquiry & Transactions
//           </CardTitle>
//           <Row className="g-3">
//             {weeklyInquiry.map((w, idx) => {
//               const options = {
//                 series: [w.inquiries],
//                 chart: { type: 'radialBar' as const, height: 90, sparkline: { enabled: true } },
//                 plotOptions: {
//                   radialBar: { hollow: { size: '50%' }, dataLabels: { show: false } },
//                 },
//                 colors: ['#0d6efd'],
//               };
//               return (
//                 <Col lg={4} key={idx}>
//                   <Card className="border p-3 h-100">
//                     <div className="d-flex align-items-center gap-3 mb-2">
//                       <div className="avatar bg-primary bg-opacity-10 rounded flex-centered">
//                         <IconifyIcon
//                           icon="ri:calendar-line"
//                           width={28}
//                           height={28}
//                           className="fs-28 text-primary"
//                         />
//                       </div>
//                       <div>
//                         <p className="fw-medium fs-15 mb-1">{w.week}</p>
//                         <p className="fw-semibold fs-20 mb-0">{w.inquiries}</p>
//                       </div>
//                     </div>
//                     <ReactApexChart
//                       options={options}
//                       series={options.series}
//                       type="radialBar"
//                       height={90}
//                     />
//                   </Card>
//                 </Col>
//               );
//             })}

//             {transactionStats.map((t, idx) => {
//               const options = {
//                 series: [t.progress],
//                 chart: { type: 'radialBar' as const, height: 90, sparkline: { enabled: true } },
//                 plotOptions: {
//                   radialBar: { hollow: { size: '50%' }, dataLabels: { show: false } },
//                 },
//                 colors: [t.variant],
//               };
//               return (
//                 <Col lg={4} key={idx}>
//                   <Card className="border p-3 h-100">
//                     <div className="d-flex align-items-center gap-3 mb-2">
//                       <div className={`avatar bg-${t.variant} bg-opacity-10 rounded flex-centered`}>
//                         <IconifyIcon
//                           icon={t.icon}
//                           width={28}
//                           height={28}
//                           className={`fs-28 text-${t.variant}`}
//                         />
//                       </div>
//                       <div>
//                         <p className="fw-medium fs-15 mb-1">{t.title}</p>
//                         <p className="fw-semibold fs-20 mb-0">{t.count}</p>
//                       </div>
//                     </div>
//                     <ReactApexChart
//                       options={options}
//                       series={options.series}
//                       type="radialBar"
//                       height={90}
//                     />
//                   </Card>
//                 </Col>
//               );
//             })}
//           </Row>
//         </CardBody>
//       </Card>

//       {/* Transaction History */}
//       <Card className="mb-4">
//         <CardBody>
//           <CardTitle as={'h4'} className="mb-3">
//             Transaction History
//           </CardTitle>
//           <Table responsive striped hover>
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Type</th>
//                 <th>Amount</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactionHistory.map((tr, idx) => (
//                 <tr key={idx}>
//                   <td>{tr.date}</td>
//                   <td>{tr.type}</td>
//                   <td>${tr.amount.toFixed(2)}</td>
//                   <td>
//                     <span
//                       className={`badge bg-${tr.status === 'Completed' ? 'success' : tr.status === 'Pending' ? 'warning' : 'danger'} text-white`}
//                     >
//                       {tr.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </CardBody>
//       </Card>

//       {/* Reviews */}
//       <Card className="mb-4">
//         <CardBody>
//           <CardTitle as={'h4'} className="mb-3">
//             Reviews / Feedback
//           </CardTitle>
//           <Row>
//             {feedbacks.map((f, idx) => (
//               <Col lg={6} key={idx}>
//                 <Card className="bg-light-subtle mb-3 h-100">
//                   <CardBody>
//                     <div className="d-flex align-items-center gap-2">
//                       {f.image && (
//                         <Image src={f.image} alt="avatar" className="rounded-circle avatar-md" />
//                       )}
//                       <div>
//                         <h5 className="fw-semibold mb-1">{f.name}</h5>
//                         <p className="m-0">
//                           @{f.userName} <span className="ms-1">({f.country})</span>
//                         </p>
//                       </div>
//                     </div>
//                     <p className="my-3">&quot;{f.description}&quot;</p>
//                     <ul className="d-flex text-warning m-0 fs-18 list-unstyled">
//                       {Array.from({ length: 5 }).map((_, i) => (
//                         <li key={i}>
//                           <IconifyIcon icon={i < f.rating ? 'ri:star-fill' : 'ri:star-line'} />
//                         </li>
//                       ))}
//                     </ul>
//                     <p className="fw-medium text-muted mb-0">{f.day} Days Ago</p>
//                   </CardBody>
//                 </Card>
//               </Col>
//             ))}
//           </Row>
//         </CardBody>
//       </Card>

//       {/* Files */}
//       <Card className="mb-4">
//         <CardBody>
//           <CardTitle as={'h4'} className="mb-3">
//             Files / Documents
//           </CardTitle>
//           <div className="d-flex flex-wrap gap-2">
//             {files.map((file, idx) => (
//               <div
//                 key={idx}
//                 className="d-flex p-2 gap-2 bg-light-subtle align-items-center border rounded position-relative"
//               >
//                 <IconifyIcon icon={file.icon} className={`text-${file.variant} fs-24`} />
//                 <div>
//                   <h4 className="fs-14 mb-1">
//                     <Link href="#" className="text-dark stretched-link">
//                       {file.name}
//                     </Link>
//                   </h4>
//                   <p className="fs-12 mb-0">{file.size} MB</p>
//                 </div>
//                 <IconifyIcon icon="ri:download-cloud-line" className="fs-20 text-muted" />
//               </div>
//             ))}
//           </div>
//         </CardBody>
//       </Card>
//     </div>
//   );
// };

// export default PatientDetails;
