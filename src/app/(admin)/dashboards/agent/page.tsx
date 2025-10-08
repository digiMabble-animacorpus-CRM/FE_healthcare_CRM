'use client';

import PageTitle from '@/components/PageTitle';
import { Col, Row } from 'react-bootstrap';
import AppointmentsOverview from './components/AppointmentsOverview';
import BranchSummaryContainer from './components/BranchSummaryContainer';
import DoctorProfile from './components/DoctorProfile';
import PatientInsightsContainer from './components/PatientInsights';
import PatientRecords from './components/PatientRecords';
import PerformanceSnapshot from './components/PerformanceSnapshot';
import TasksReminders from './components/TaskReminders';
import TodayAppointments from './components/TodayAppointments';
import WeeklySchedule from './components/WeeklySchedule';

// ===================
// Define role directly
// ===================
type Role = 'super_admin' | 'admin' | 'doctor';
// You can replace this hard-coded value with real user data later
const role: Role = 'super_admin';

// Helper to check if user is admin/super_admin
const isAdmin = (role: Role) => ['admin', 'super_admin'].includes(role);

const AgentPage = () => {
  return (
    <>
      <PageTitle title="Tableau de bord" subName={isAdmin(role) ? 'Admin' : 'Doctor'} />

      {/* ========== ADMIN / SUPER ADMIN DASHBOARD ========== */}
      {isAdmin(role) && (
        <Row className="gy-4">
          <Col xs={12}>
            <BranchSummaryContainer />
          </Col>

          <Col lg={12}>
            <AppointmentsOverview
              upcomingCount={36}
              cancellationsWeek={5}
              completedWeek={128}
              upcoming={Array.from({ length: 6 }).map((_, i) => ({
                id: `apt-${i}`,
                date: '2025-08-18',
                time: '10:00',
                patient: `Patient ${i + 1}`,
                doctor: ['Dr. Martin', 'Dr. Clara', 'Dr. Paul'][i % 3],
                branch: ['Gembloux - Orneau', 'Gembloux - Tout Vent', 'Namur'][i % 3],
                status: 'Programmé',
              }))}
            />
          </Col>

          <Col lg={12}>
            <PatientInsightsContainer />
          </Col>
        </Row>
      )}

      {/* ========== DOCTOR DASHBOARD ========== */}
      {!isAdmin(role) && (
        <Row className="gy-4">
          <Col lg={4}>
            <DoctorProfile
              name="Dr. Clara Dupont"
              specialization="Psychotherapy"
              branch="Gembloux - Orneau"
              todayStatus="Available"
            />
            <PerformanceSnapshot
              weekAppointments={22}
              noShows={2}
              cancellations={1}
              satisfactionScore={4.6}
            />
            <TasksReminders
              items={[
                { id: 't1', text: 'Call patient (follow-up on CBT worksheet)', due: 'Today' },
                { id: 't2', text: 'Finish yesterday’s session notes', due: 'Today' },
                { id: 't3', text: 'Prepare report for school meeting', due: 'Fri' },
              ]}
            />
          </Col>

          <Col lg={8}>
            <TodayAppointments
              items={[
                { id: 'a1', time: '09:00', patient: 'Elias H.', reason: 'Follow-up', room: 'R2' },
                {
                  id: 'a2',
                  time: '10:30',
                  patient: 'Sarah L.',
                  reason: 'Initial consult',
                  room: 'R1',
                },
                {
                  id: 'a3',
                  time: '11:30',
                  patient: 'Mehdi B.',
                  reason: 'Therapy Session',
                  room: 'R3',
                },
              ]}
            />

            <WeeklySchedule
              week={{
                Mon: [
                  { time: '09:00', patient: 'Elias H.' },
                  { time: '11:30', patient: 'Mehdi B.' },
                ],
                Tue: [{ time: '10:30', patient: 'Sarah L.' }],
                Wed: [],
                Thu: [
                  { time: '14:00', patient: 'Alex P.' },
                  { time: '16:00', patient: '— Free slot —' },
                ],
                Fri: [{ time: '09:30', patient: 'Clara M.' }],
                Sat: [],
                Sun: [],
              }}
            />

            <PatientRecords
              recent={[
                { id: 'p1', name: 'Elias Hachemi', lastSeen: 'Yesterday' },
                { id: 'p2', name: 'Sarah Lem', lastSeen: 'Today' },
                { id: 'p3', name: 'Mehdi Ben', lastSeen: '2 days ago' },
              ]}
              assigned={[
                { id: 'p10', name: 'Clara Mond', since: '2025-03-20' },
                { id: 'p11', name: 'Paul S.', since: '2025-04-02' },
              ]}
            />
          </Col>
        </Row>
      )}
    </>
  );
};

export default AgentPage;
