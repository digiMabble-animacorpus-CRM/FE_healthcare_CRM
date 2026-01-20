'use client';

import { Button } from 'react-bootstrap';
import { TimeFilterType } from '../dashboard.types';

interface TimeFilterProps {
  value: TimeFilterType;
  onChange: (value: TimeFilterType) => void;
}

export default function TimeFilter({ value, onChange }: TimeFilterProps) {
  const filters: TimeFilterType[] = ['today', 'week', 'month', 'all'];

  return (
    <div
      className="d-inline-flex p-1 rounded-pill gap-1"
      style={{
        background: '#fcfdfdff',
        border: '1px solid #e0e0e0',
      }}
    >
      {filters.map((f) => {
        const isActive = value === f;

        return (
          <Button
            key={f}
            onClick={() => onChange(f)}
            size="sm"
            className="rounded-pill px-2 fs-6 fs-md-6 fs-lg-5 px-md-3 px-lg-4"
            variant="light"
            style={{
              background: isActive ? 'var(--bs-primary)' : 'transparent',
              color: isActive ? '#fff' : '#333',
              transition: 'all 0.25s ease',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            {f === 'today'
              ? 'Aujourd’hui'
              : f === 'week'
                ? 'Cette semaine'
                : f === 'month'
                  ? 'Ce mois-ci'
                  : 'Tout'}
          </Button>
        );
      })}
    </div>
  );
}
