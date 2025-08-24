'use client';

import { useEffect, useState } from 'react';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import profileBannerImg from '@/assets/images/properties/p-12.jpg';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, Col, Row } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import axios from 'axios';

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH;

// fallback mock data
const MOCK_DATA: ProfileDetailsProps = {
  team_id: "3d52f4d9-9327-4b59-92e1-810d756ba3dd",
  last_name: "Duhainaut",
  first_name: "Chloé",
  full_name: "Chloé Duhainaut",
  job_1: "Neuropsychologue",
  who_am_i:
    "Je m’appelle Chloé et je suis diplômée d’un master en psychologie clinique avec une spécialisation en neuropsychologie à l’UCLouvain. Je suis passionnée par le fonctionnement cognitif et sur l’influence que celui-ci a sur les différentes sphères du comportement humain.",
  consultations:
    "Je reçois un public varié ; enfants, adolescents, adultes et personnes âgées. Je réalise des bilans de différents types en fonction de la demande.",
  office_address:
    "Anima Corpus Namur, Av. Cardinal Mercier, 46, 5000 Namur, namur@animacorpus.be, 0492/40.18.77",
  contact_email: "Chloe.duhainaut@animacorpus.be",
  contact_phone: "0487/35.26.78.",
  schedule: {
    text: "Je reçois au cabinet de Namur : mardi, mercredi, vendredi",
  },
  about:
    "Je reçois enfants, ados et adultes pour la réalisation de bilans QI, neuropsy (attention, mémoire, fonctions exécutives) et suivis individuels en neuropsychologie.",
  languages_spoken: ["Français (Français)"],
  payment_methods: ["Cash", "Paiement mobile (QR code)"],
  diplomas_and_training: [
    "Master en sciences psychologiques à finalité neuropsychologie à l'UCLouvain",
  ],
  specializations: [
    "Neuropsychologie Partiellement conventionné, en fonction de votre mutuelle",
  ],
  website: "https://chloeduhainautpsy.com/",
  frequently_asked_questions:
    "Les nouveaux patients sont-ils acceptés ? Oui. Où travaille Chloé ? À Anima Corpus Namur.",
  calendar_links: [
    "https://rosa.be/fr/booking/hp/chloe-duhainaut-1/is-new-patient/?site=65abbcafe53262516dd5529c",
  ],
  photo: "",
};

const ProfileDetails = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileDetailsProps | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          console.warn("No user found in localStorage");
          setProfileData(MOCK_DATA); // fallback if no user
          return;
        }

        const user = JSON.parse(userString);
        const teamId = user?.team_id;
        if (!teamId) {
          console.warn("No team_id inside user object");
          setProfileData(MOCK_DATA);
          return;
        }

        // try API
        const res = await axios.get(`${API_BASE_PATH}/team-members/${teamId}`);
        setProfileData(res.data);
      } catch (err) {
        console.error("Error fetching profile, using mock data:", err);
        setProfileData(MOCK_DATA);
      }
    };

    fetchProfile();
  }, []);

  if (!profileData) {
    return <p>Loading profile...</p>;
  }

  const {
    team_id,
    last_name,
    first_name,
    full_name,
    job_1,
    job_2,
    job_3,
    job_4,
    specific_audience,
    specialization_1,
    who_am_i,
    consultations,
    office_address,
    contact_email,
    contact_phone,
    schedule,
    about,
    languages_spoken = [],
    payment_methods = [],
    diplomas_and_training = [],
    specializations = [],
    website,
    frequently_asked_questions,
    calendar_links = [],
    photo,
  } = profileData;

  return (
    <div>
      {/* Back Button */}
      <div className="d-flex justify-content-between mb-3 gap-2 flex-wrap">
        <Button
          variant="outline-secondary"
          onClick={() => router.push("/dashboards/agent")}
        >
          <IconifyIcon icon="ri:arrow-left-line" /> Back
        </Button>
      </div>

      {/* Banner */}
      <Card className="mb-4">
        <CardBody className="p-0">
          <Image src={profileBannerImg} alt="banner" className="img-fluid rounded-top" />
        </CardBody>
      </Card>

      {/* Profile Header */}
      <Card className="mb-4">
        <CardBody>
          <div className="d-flex align-items-center gap-3">
            <Image
              src={photo || avatar2}
              alt="avatar"
              width={80}
              height={80}
              className="rounded-circle avatar-xl img-thumbnail"
            />
            <div>
              <h3 className="fw-semibold mb-1">{full_name}</h3>
              <p className="link-primary fw-medium fs-14">{job_1}</p>
              <p className="mb-0 text-muted">Team ID: {team_id}</p>
            </div>
          </div>

          <Row className="my-4">
            <Col lg={6}>
              <p className="fw-semibold mb-1">Email:</p>
              <p>{contact_email || "-"}</p>
            </Col>
            <Col lg={6}>
              <p className="fw-semibold mb-1">Phone:</p>
              <p>{contact_phone || "-"}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={6}>
              <p className="fw-semibold mb-1">Office Address:</p>
              <p>{office_address || "-"}</p>
            </Col>
            <Col lg={6}>
              <p className="fw-semibold mb-1">Consultations:</p>
              <p>{consultations || "-"}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">About:</p>
              <p>{about || "-"}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={4}>
              <p className="fw-semibold mb-1">Languages Spoken:</p>
              <p>{languages_spoken.join(", ") || "-"}</p>
            </Col>
            <Col lg={4}>
              <p className="fw-semibold mb-1">Payment Methods:</p>
              <p>{payment_methods.join(", ") || "-"}</p>
            </Col>
            <Col lg={4}>
              <p className="fw-semibold mb-1">Schedule:</p>
              <p>{schedule?.text || "-"}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">Diplomas / Training:</p>
              <p>{diplomas_and_training.join(", ") || "-"}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">Specializations:</p>
              <p>{specializations.join(", ") || "-"}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">Who Am I:</p>
              <p>{who_am_i || "-"}</p>
            </Col>
          </Row>

          <Row className="my-4">
            <Col lg={12}>
              <p className="fw-semibold mb-1">Website:</p>
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
              <p className="fw-semibold mb-1">Frequently Asked Questions:</p>
              <p>{frequently_asked_questions || "-"}</p>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfileDetails;
