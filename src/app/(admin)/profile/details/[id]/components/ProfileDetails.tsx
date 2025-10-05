'use client';

import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';

type ProfileDetailsProps = {
  team_id: string;
  last_name: string;
  first_name: string;
  full_name: string;
  job_1: string;
  contact_email?: string;
  contact_phone?: string;
  schedule?: { array: { day: string; startTime: string; endTime: string }[]; text: string };
  languages_spoken?: string[];
  payment_methods?: string[];
  diplomas_and_training?: string[];
  specializations?: string[];
  who_am_i?: string;
  website?: string;
  about?: string;
  consultations?: string;
  frequently_asked_questions?: string;
  photo?: string;
};

const ProfileDetails = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileDetailsProps | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const res = await axios.get(`${API_BASE_PATH}/profile`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        const apiProfile = res.data?.therapistTeamMembers;
        if (!apiProfile) return;

        // Normalize FAQ
        let faqString = '';
        try {
          if (typeof apiProfile.faq === 'string') {
            // Try parsing JSON string
            const parsed = JSON.parse(apiProfile.faq);
            if (Array.isArray(parsed)) {
              faqString = parsed.join('\r\n');
            } else {
              faqString = apiProfile.faq;
            }
          }
        } catch {
          faqString = String(apiProfile.faq || '');
        }

        const normalized: ProfileDetailsProps = {
          team_id: apiProfile.therapistId?.toString() || '',
          last_name: apiProfile.lastName || '',
          first_name: apiProfile.firstName || '',
          full_name: apiProfile.fullName || '',
          job_1: '',
          contact_email: apiProfile.contactEmail || '',
          contact_phone: apiProfile.contactPhone || '',
          schedule: {
            array: apiProfile.availability || [],
            text: apiProfile.availability
              ? apiProfile.availability
                  .map((a: any) => `${a.day} ${a.startTime}-${a.endTime}`)
                  .join('\n')
              : '',
          },
          languages_spoken: apiProfile.languagesSpoken || [],
          payment_methods: apiProfile.payment_methods || [],
          diplomas_and_training: apiProfile.degreesTraining
            ? apiProfile.degreesTraining.split('\r\n').filter((d: string) => d.trim() !== '')
            : [],
          specializations: apiProfile.specializations || [],
          who_am_i: apiProfile.aboutMe || '',
          website: apiProfile.website || '',
          about: apiProfile.aboutMe || '',
          consultations: apiProfile.consultations || '',
          frequently_asked_questions: faqString,
          photo: apiProfile.imageUrl || '',
        };

        setProfileData(normalized);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  if (!profileData) return <p>Check the User profile...</p>;

  const {
    full_name,
    job_1,
    contact_email,
    contact_phone,
    about,
    languages_spoken = [],
    payment_methods = [],
    diplomas_and_training = [],
    specializations = [],
    who_am_i,
    website,
    consultations,
    schedule,
    photo,
    frequently_asked_questions,
  } = profileData;

  const formatTime = (time: string, type: 'am' | 'pm') => {
    const [h, m] = time.split(':').map(Number);
    let hour = h;
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${type.toUpperCase()}`;
  };

  const renderSchedule = (schedule: ProfileDetailsProps['schedule']) => {
    return (
      <div className="mb-3 d-flex flex-wrap gap-2">
        {schedule?.array?.map((a, idx) => (
          <div key={idx} className="d-flex align-items-center gap-2">
            <span className="badge bg-primary" style={{ fontSize: '0.85rem' }}>
              {a.day}
            </span>
            <span style={{ fontSize: '0.85rem' }}>
              {formatTime(a.startTime, 'am')} - {formatTime(a.endTime, 'pm')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
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
              <p className="fw-semibold mb-1">Consultations:</p>
              <p>{consultations || '-'}</p>
            </Col>
            <Col lg={6}>
              <p className="fw-semibold mb-1">À propos:</p>
              <p>{about || '-'}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={6}>
              <p className="fw-semibold mb-1">Langues parlées:</p>
              <p>{languages_spoken.join(', ') || '-'}</p>
            </Col>
            <Col lg={6}>
              <p className="fw-semibold mb-1">Méthodes de paiement:</p>
              <p>{payment_methods.join(', ') || '-'}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={6}>
              <p className="fw-semibold mb-1">Calendrier:</p>
              {schedule?.array?.length ? renderSchedule(schedule) : <span>-</span>}
            </Col>
            <Col lg={6}>
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

          {/* <Row className="my-4">
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
          </Row> */}

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

          {/* FAQ Section with Question/Answer pairing */}
          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">Questions fréquemment posées:</p>
              {frequently_asked_questions ? (
                <ol style={{ paddingLeft: '1.2rem' }}>
                  {(() => {
                    const lines = (frequently_asked_questions || '')
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
