'use client';
import { Card, CardBody, CardHeader, CardTitle, Col, ProgressBar, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { currency } from '@/context/constants';
import Image from 'next/image';
import avatar3 from '@/assets/images/users/avatar-3.jpg';
import avatar4 from '@/assets/images/users/avatar-4.jpg';
import avatar5 from '@/assets/images/users/avatar-5.jpg';
import avatar6 from '@/assets/images/users/avatar-6.jpg';
import avatar7 from '@/assets/images/users/avatar-7.jpg';

type PaymentMethod = {
  method: string;
  amount: number;
};

interface FinancialsProps {
  revenueWeek: number;
  revenueMonth: number;
  outstandingPayments: number;
  paymentMethods: PaymentMethod[];
}

const num = (n: number) => new Intl.NumberFormat().format(n);

const Financials = ({
  revenueWeek,
  revenueMonth,
  outstandingPayments,
  paymentMethods,
}: FinancialsProps) => {
  const totalRevenue = revenueMonth; // for progress calculation
  const collected = revenueMonth - outstandingPayments;
  const progressPct = Math.round((collected / totalRevenue) * 100);

  const avatars = [avatar4, avatar5, avatar3, avatar6, avatar7];

  return (
    <Col lg={12}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <CardTitle as="h4">Financial Overview</CardTitle>
        </CardHeader>
        <CardBody>
          {/* Total Revenue */}
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted fs-14 mb-2">Revenue This Month</p>
              <h3 className="text-dark fw-bold mb-1">
                {currency}
                {num(revenueMonth)}
              </h3>
            </div>
            <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
              <IconifyIcon
                icon="mdi:currency-eur"
                width={32}
                height={32}
                className="fs-32 text-primary"
              />
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            style={{ height: 15 }}
            now={progressPct}
            striped
            animated
            variant="success"
            className="mt-3"
            role="progressbar"
          />

          {/* Collected / Pending */}
          <div className="d-flex align-items-center justify-content-between mt-3">
            <div>
              <p className="mb-2 text-success fs-15 fw-medium">Collected</p>
              <h4 className="text-dark fw-bold mb-0">
                {currency}
                {num(collected)}
              </h4>
            </div>
            <div className="text-end">
              <p className="mb-2 fs-15 fw-medium">Pending</p>
              <h4 className="text-dark fw-bold mb-0">
                {currency}
                {num(outstandingPayments)}
              </h4>
            </div>
          </div>

          {/* Top Outstanding / Action */}
          <div className="d-flex align-items-center bg-light-subtle border justify-content-between p-3 rounded mt-4">
            <div>
              <h5 className="fw-medium mb-1 text-dark fs-16">Top Pending Payments</h5>
              <div className="avatar-group mt-3">
                {avatars.map((av, idx) => (
                  <div
                    className="avatar d-flex align-items-center justify-content-center"
                    key={idx}
                  >
                    <Image
                      src={av}
                      alt={`avatar-${idx}`}
                      className="rounded-circle avatar border border-light border-3"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Button variant="primary">Send Reminder</Button>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="mt-4">
            {paymentMethods.map((p, idx) => (
              <div key={idx} className="d-flex justify-content-between mb-2">
                <span>{p.method}</span>
                <span>
                  {currency}
                  {num(p.amount)}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default Financials;
