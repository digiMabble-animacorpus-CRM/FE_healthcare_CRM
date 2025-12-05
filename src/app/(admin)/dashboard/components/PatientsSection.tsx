'use client';

import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { PatientInsights, TimeFilterType } from '../dashboard.types';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// =====================================================
// SKELETON
// =====================================================
export function PatientsSectionSkeleton() {
  return (
    <Card className="p-3 mb-4 shadow-sm">
      <div className="placeholder-wave mb-3">
        <div className="placeholder col-4" style={{ height: 30 }}></div>
      </div>

      <Row className="g-3">
        {[1, 2, 3].map((i) => (
          <Col md={4} key={i}>
            <Card className="p-3 shadow-sm h-100">
              <div className="placeholder-wave">
                <div className="placeholder col-6 mb-2" style={{ height: 20 }}></div>
                <div className="placeholder col-8 mb-2" style={{ height: 16 }}></div>
                <div className="placeholder col-5 mb-2" style={{ height: 16 }}></div>
                <div className="placeholder col-3" style={{ height: 16 }}></div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

// =====================================================
// COMPONENT
// =====================================================
interface PatientsSectionProps {
  data: PatientInsights;
  timeFilter: TimeFilterType;
  onTimeFilterChange: (value: TimeFilterType) => void;
}

export default function PatientsSection({
  data,
  timeFilter,
  onTimeFilterChange,
}: PatientsSectionProps) {
  const makeDonut = (obj: Record<string, number>, colors: string[]) => ({
    labels: Object.keys(obj),
    datasets: [
      {
        data: Object.values(obj),
        backgroundColor: colors,
        borderWidth: 4,
        borderColor: '#fff',
        hoverOffset: 6,
      },
    ],
  });

  const donutOptions = {
    cutout: '70%',
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Colors
  const genderColors = ['#0066ff', '#ff2fa0'];
  const ageColors = ['#ff7f50', '#7f6bff', '#00bcd4', '#ffca28', '#6fcf97'];

  // Donut data
  const genderDonut = makeDonut(data.genderCounts, genderColors);
  const ageDonut = makeDonut(data.ageBuckets, ageColors);

  const makeBars = (obj: Record<string, number>) => {
    const total = Object.values(obj).reduce((a, b) => a + b, 0);
    return Object.entries(obj).map(([label, count]) => ({
      label,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    }));
  };

  const statusBars = makeBars(data.statusCounts);

  return (
    <Card
      className="p-4 mb-4 shadow-sm border-0 rounded-4"
      style={{ background: '#EEF3FB' }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4 flex-column flex-md-row gap-3">
        <h4 className="fw-bold m-0">Patient Insights</h4>
      </div>

      <Row className="g-4">
        {/* ==================================================
              1. GENDER DISTRIBUTION
        ================================================== */}
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100 rounded-4 border-0">
            <h6 className="fw-semibold mb-3">Gender Distribution</h6>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div style={{ width: 120, height: 120 }}>
                <Doughnut data={genderDonut} options={donutOptions} />
              </div>

              <div>
                <div className="d-flex align-items-center mb-2">
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      background: genderColors[0],
                      borderRadius: '50%',
                      marginRight: 8,
                    }}
                  />
                  <strong>Male:</strong>&nbsp;{data.genderCounts.male}
                </div>

                <div className="d-flex align-items-center">
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      background: genderColors[1],
                      borderRadius: '50%',
                      marginRight: 8,
                    }}
                  />
                  <strong>Female:</strong>&nbsp;{data.genderCounts.female}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* ==================================================
              2. AGE GROUPS
        ================================================== */}
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100 rounded-4 border-0">
            <h6 className="fw-semibold mb-3">Age Groups</h6>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div style={{ width: 120, height: 120 }}>
                <Doughnut data={ageDonut} options={donutOptions} />
              </div>

              <div>
                {Object.entries(data.ageBuckets).map(([label, count], i) => (
                  <div key={label} className="mb-2 d-flex align-items-center">
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: ageColors[i],
                        borderRadius: '50%',
                        marginRight: 8,
                      }}
                    />
                    <strong>{label}:</strong>&nbsp;{count}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        {/* ==================================================
              3. PATIENT STATUS
        ================================================== */}
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100 rounded-4 border-0">
            <h6 className="fw-semibold mb-3">Patient Status</h6>

            {statusBars.map((item) => (
              <div key={item.label} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-capitalize">{item.label}</span>
                  <strong>{item.count}</strong>
                </div>

                <ProgressBar
                  now={item.percent}
                  variant={item.label === 'active' ? 'success' : 'secondary'}
                  style={{ height: 7, borderRadius: 4 }}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </Card>
  );
}
