"use client";

import { useEffect, useState } from "react";
import avatar2 from "@/assets/images/users/avatar-2.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button, Col, Row } from "react-bootstrap";
import axios from "axios";

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

const ProfileDetails = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileDetailsProps | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.warn("No access token found");
          return;
        }

        const res = await axios.get("http://164.92.220.65/api/v1/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // console.log("Fetched profile data:", res.data);

        // Extract nested team object
        const apiProfile = res.data?.user?.team;
        if (!apiProfile) {
          console.error("No team object in API response");
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
          photo: apiProfile.photo || "",
        };

        setProfileData(normalized);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  if (!profileData) {
    return <p>Loading profile...</p>;
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

  return (
    <div>
      {/* Back Button */}
      <div className="d-flex justify-content-between mb-3 gap-2 flex-wrap">
        <Button variant="outline-secondary" onClick={() => router.push("/dashboards/agent")}>
          <IconifyIcon icon="ri:arrow-left-line" /> Back
        </Button>
      </div>

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
