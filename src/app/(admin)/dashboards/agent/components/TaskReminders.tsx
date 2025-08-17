'use client';

import { Card, CardBody, ListGroup } from 'react-bootstrap';

const TasksReminders = ({ items }: { items: { id: string; text: string; due?: string }[] }) => {
  return (
    <Card className="mb-3">
      <CardBody>
        <h5 className="mb-3">Tasks / Reminders</h5>
        <ListGroup>
          {items.map((t) => (
            <ListGroup.Item
              key={t.id}
              className="d-flex justify-content-between align-items-center"
            >
              <span>{t.text}</span>
              <small className="text-muted">{t.due ?? ''}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default TasksReminders;
