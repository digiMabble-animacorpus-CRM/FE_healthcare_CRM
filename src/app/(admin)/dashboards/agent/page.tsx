'use client';

import { Row, Col } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import AppointmentsOverview from './components/AppointmentsOverview';
import BranchSummary from './components/BranchSummary';
import DoctorPerformance from './components/DoctorPerformance';
import DoctorProfile from './components/DoctorProfile';
import Financials from './components/Financials';
import PatientInsights from './components/PatientInsights';
import PatientRecords from './components/PatientRecords';
import PerformanceSnapshot from './components/PerformanceSnapshot';
import ReportsTrends from './components/ReportsTrends';
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
      <PageTitle title="Dashboard" subName={isAdmin(role) ? 'Admin' : 'Doctor'} />

      {/* ========== ADMIN / SUPER ADMIN DASHBOARD ========== */}
      {isAdmin(role) && (
        <Row className="gy-4">
          <Col xs={12}>
            <BranchSummary
              summaries={[
                {
                  branchId: 1,
                  branchName: 'Gembloux - Orneau',
                  doctors: 12,
                  patients: 420,
                  appointmentsMonth: 320,
                  revenueMonth: 21850,
                },
                {
                  branchId: 2,
                  branchName: 'Gembloux - Tout Vent',
                  doctors: 8,
                  patients: 290,
                  appointmentsMonth: 210,
                  revenueMonth: 14600,
                },
                {
                  branchId: 3,
                  branchName: 'Anima Corpus Namur',
                  doctors: 10,
                  patients: 350,
                  appointmentsMonth: 275,
                  revenueMonth: 19200,
                },
              ]}
              onBranchClick={(b) => console.log('Go to branch detail:', b)}
            />
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
                branch: ['Orneau', 'Tout Vent', 'Namur'][i % 3],
                status: 'SCHEDULED',
              }))}
            />
          </Col>

          <Col lg={6}>
            <PatientInsights
              newPatientsWeek={22}
              newPatientsMonth={93}
              demographics={{
                gender: { male: 48, female: 52, other: 0 },
                ageBuckets: [
                  { label: '0-12', value: 12 },
                  { label: '13-25', value: 18 },
                  { label: '26-40', value: 34 },
                  { label: '41-60', value: 22 },
                  { label: '60+', value: 14 },
                ],
                topCities: [
                  { city: 'Gembloux', count: 140 },
                  { city: 'Namur', count: 120 },
                  { city: 'Ottignies', count: 60 },
                ],
              }}
            />
          </Col>

          <Col lg={6}>
            <Financials
              revenueWeek={8650}
              revenueMonth={55650}
              outstandingPayments={2140}
              paymentMethods={[
                { method: 'Insurance', amount: 31200 },
                { method: 'Self-pay', amount: 21450 },
                { method: 'Other', amount: 3000 },
              ]}
            />
          </Col>

          <Col xs={12}>
            <ReportsTrends
              appointmentsSeries={[
                { label: 'Appointments', points: [18, 24, 26, 19, 30, 27, 33, 29, 35, 31, 34, 38] },
              ]}
              patientGrowthSeries={[
                { label: 'New Patients', points: [12, 14, 9, 16, 20, 18, 22, 24, 19, 23, 28, 31] },
              ]}
              revenueSeries={[
                {
                  label: 'Revenue (€)',
                  points: [3500, 4200, 3900, 4300, 4700, 5100, 4900, 5200, 5600, 6000, 6100, 6500],
                },
              ]}
              xLabels={[
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ]}
            />
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
