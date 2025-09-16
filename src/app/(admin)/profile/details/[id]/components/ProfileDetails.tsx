'use client';

import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Table } from 'react-bootstrap';

type ProfileDetailsProps = {
  team_id: string;
  last_name: string;
  first_name: string;
  full_name: string;
  job_1: string;
  job_2?: string;
  job_3?: string;
  job_4?: string;
  specific_audience?: string;
  specialization_1?: string;
  who_am_i?: string;
  consultations?: string;
  office_address?: string;
  contact_email?: string;
  contact_phone?: string;
  schedule?: { text: string };
  about?: string;
  languages_spoken?: string[];
  payment_methods?: string[];
  diplomas_and_training?: string[];
  specializations?: string[];
  website?: string;
  frequently_asked_questions?: string;
  calendar_links?: string[];
  photo?: string;
};

const daysOfWeek = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
];

const ProfileDetails = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileDetailsProps | null>(
    null
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.warn('No access token found');
          return;
        }

        const res = await axios.get(`${API_BASE_PATH}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const apiProfile = res.data?.user?.team;
        if (!apiProfile) {
          console.error('No team object in API response');
          return;
        }

        const normalized: ProfileDetailsProps = {
          team_id: apiProfile.team_id,
          last_name: apiProfile.last_name,
          first_name: apiProfile.first_name,
          full_name: apiProfile.full_name,
          job_1: apiProfile.job_1,
          job_2: apiProfile.job_2,
          job_3: apiProfile.job_3,
          job_4: apiProfile.job_4,
          specific_audience: apiProfile.specific_audience,
          specialization_1: apiProfile.specialization_1,
          who_am_i: apiProfile.who_am_i,
          consultations: apiProfile.consultations,
          office_address: apiProfile.office_address,
          contact_email: apiProfile.contact_email,
          contact_phone: apiProfile.contact_phone,
          schedule: apiProfile.schedule,
          about: apiProfile.about,
          languages_spoken: apiProfile.languages_spoken || [],
          payment_methods: apiProfile.payment_methods || [],
          diplomas_and_training: apiProfile.diplomas_and_training || [],
          specializations: apiProfile.specializations || [],
          website: apiProfile.website,
          frequently_asked_questions: apiProfile.frequently_asked_questions,
          calendar_links: apiProfile.calendar_links || [],
          photo: apiProfile.photo || '',
        };
        setProfileData(normalized);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  if (!profileData) {
    return <p>Check the User profile...</p>;
  }

  const {
    full_name,
    job_1,
    contact_email,
    contact_phone,
    office_address,
    consultations,
    about,
    languages_spoken = [],
    payment_methods = [],
    diplomas_and_training = [],
    specializations = [],
    who_am_i,
    website,
    frequently_asked_questions,
    schedule,
    photo,
  } = profileData;

  // 🔹 Custom parser for schedule string
  const renderSchedule = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');

    const phoneMatch = text.match(/(\d{3,4}\/\d{2}\.\d{2}\.\d{2})/);
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);

    // 🔹 Detect branch blocks: assume branch name line followed by address line
    const branchPairs: { branch: string; address: string }[] = [];
    for (let i = 0; i < lines.length - 1; i++) {
      let current = lines[i];
      const next = lines[i + 1];

      if (
        /Gembloux|Namur|Anima Corpus|Soul Body/i.test(current) &&
        /\d{4}/.test(next) // address usually contains postal code
      ) {
        // 🔹 Strip extra text like phone/email sentence before the branch name
        current = current
          .replace(/^.*?(Anima Corpus.*|Soul Body.*|Gembloux.*)$/i, '$1')
          .trim();

        branchPairs.push({ branch: current, address: next });
        i++; // skip next line as it's already used
      }
    }

    return (
      <div>
        {/* Highlight days */}
        <div className="mb-3">
          {daysOfWeek.map((day) => {
            const regex = new RegExp(day, 'i');
            if (regex.test(text)) {
              return (
                <span
                  key={day}
                  className="badge bg-primary me-2 mb-2"
                  style={{ fontSize: '0.85rem' }}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
              );
            }
            return null;
          })}
        </div>

        {/* Contact info */}
        <div className="mb-3">
          {phoneMatch && (
            <p>
              <strong>Téléphone:</strong> {phoneMatch[0]}
            </p>
          )}
          {emailMatch && (
            <p>
              <strong>Email:</strong> {emailMatch[0]}
            </p>
          )}
        </div>

        {/* Branch table */}
        {branchPairs.length > 0 && (
          <div>
            <h6 className="fw-semibold">Nos Cabinets :</h6>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Adresse</th>
                </tr>
              </thead>
              <tbody>
                {branchPairs.map((b, idx) => (
                  <tr key={idx}>
                    <td>{b.branch}</td>
                    <td>{b.address}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Profile Header */}
      <Card className="mb-4">
        <CardBody>
          <div className="d-flex align-items-center gap-3">
            {photo && photo !== 'null' && photo.trim() !== '' ? (
              <Image
                src={photo}
                alt={full_name}
                width={80}
                height={80}
                className="rounded-circle avatar-xl img-thumbnail"
              />
            ) : (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#e7ddff',
                  color: '#341539',
                  fontSize: '40px',
                  fontWeight: 'bold',
                }}
              >
                {full_name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="fw-semibold mb-1">{full_name}</h3>
              <p className="link-primary fw-medium fs-14">{job_1}</p>
            </div>
          </div>

          <Row className="my-4">
            <Col lg={6}>
              <p className="fw-semibold mb-1">E-mail:</p>
              <p>{contact_email || '-'}</p>
            </Col>
            <Col lg={6}>
              <p className="fw-semibold mb-1">Téléphone:</p>
              <p>{contact_phone || '-'}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={6}>
              <p className="fw-semibold mb-1">Adresse du bureau:</p>
              <p>{office_address || '-'}</p>
            </Col>
            <Col lg={6}>
              <p className="fw-semibold mb-1">Consultations:</p>
              <p>{consultations || '-'}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">À propos:</p>
              <p>{about || '-'}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={3}>
              <p className="fw-semibold mb-1">Langues parlées:</p>
              <p>{languages_spoken.join(', ') || '-'}</p>
            </Col>
            <Col lg={3}>
              <p className="fw-semibold mb-1">Méthodes de paiement:</p>
              <p>{payment_methods.join(', ') || '-'}</p>
            </Col>
            <Col lg={6}>
              <p className="fw-semibold mb-1">Calendrier:</p>
              {schedule?.text ? renderSchedule(schedule.text) : <span>-</span>}
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">Diplômes / Formation:</p>
              {diplomas_and_training.length > 0 ? (
                <ul>
                  {diplomas_and_training.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <span>-</span>
              )}
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">Spécialisations:</p>
              {specializations.length > 0 ? (
                <ul>
                  {specializations.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <span>-</span>
              )}
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">Qui suis-je:</p>
              <p>{who_am_i || '-'}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">Site web:</p>
              {website ? (
                <Link href={website} target="_blank" className="text-primary">
                  {website}
                </Link>
              ) : (
                <span>-</span>
              )}
            </Col>
          </Row>
          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">Questions fréquemment posées:</p>
              {frequently_asked_questions ? (
                <ol style={{ paddingLeft: '1.2rem' }}>
                  {(() => {
                    const lines = frequently_asked_questions
                      .split('\r\n')
                      .filter((line) => line.trim() !== '');
                    const items: { question: string; answer: string }[] = [];
                    for (let i = 0; i < lines.length; i += 2) {
                      const question = lines[i] || '';
                      const answer = lines[i + 1] || '';
                      items.push({ question, answer });
                    }
                    return items.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '1rem' }}>
                        <div>
                          <strong>{item.question.trim()}</strong>
                        </div>
                        <div>{item.answer.trim()}</div>
                      </li>
                    ));
                  })()}
                </ol>
              ) : (
                <span>-</span>
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfileDetails;
