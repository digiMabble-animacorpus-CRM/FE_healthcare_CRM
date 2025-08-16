'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Props {
  onCheck: (email: string) => void;
  show: boolean;
  onClose: () => void;
  isCustomerNotFound: boolean;
}

const CheckCustomerModal = ({ show, onClose, onCheck, isCustomerNotFound }: Props) => {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Check Customer Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter customer's email"
          />
        </Form.Group>

        {isCustomerNotFound && (
          <p className="text-danger mt-2">
            Customer not found. You can create a new customer or check a different email.
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {!isCustomerNotFound ? (
          <Button variant="primary" onClick={() => onCheck(email)}>
            Check
          </Button>
        ) : (
          <>
            <Button variant="primary" onClick={() => onCheck(email)}>
              Check Again
            </Button>
            <Button
              variant="success"
              onClick={() => router.push('/customer-enquiries/add-enquiry')}
            >
              Create New Customer
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CheckCustomerModal;
