'use client';

import { useEffect } from 'react';
import { Button, Col, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';

import type { OffcanvasControlType } from '@/types/context';
import { useLayoutContext } from '@/context/useLayoutContext';
import SimplebarReactClient from './wrappers/SimplebarReactClient';

/* ------------------------------------------------------------------
   DEFAULT ENFORCED SETTINGS (NO USER CHOICE)
   ------------------------------------------------------------------ */

const EnforcedDefaults = () => {
  const {
    changeTheme,
    changeTopbarTheme,
    changeMenu,
  } = useLayoutContext();

  useEffect(() => {
    // Force defaults
    changeTheme('light');
    changeTopbarTheme('light');
    changeMenu.theme('light');
    changeMenu.size('hidden');
  }, []);

  return null;
};

/* ------------------------------------------------------------------
   UI (OPTIONS COMMENTED OUT)
   ------------------------------------------------------------------ */

const ThemeCustomizer = ({ open, toggle }: OffcanvasControlType) => {
  const { resetSettings } = useLayoutContext();

  return (
    <Offcanvas
      placement="end"
      show={open}
      onHide={toggle}
      className="border-0 rounded-start-4 overflow-hidden"
      tabIndex={-1}
    >
      {/* Enforce defaults once */}
      <EnforcedDefaults />

      <OffcanvasHeader
        closeVariant="white"
        closeButton
        className="d-flex align-items-center bg-primary p-3"
      >
        <h5 className="text-white m-0">Theme Settings</h5>
      </OffcanvasHeader>

      <OffcanvasBody className="p-0">
        <SimplebarReactClient className="h-100">
          <div className="p-3 settings-bar">

            {/* ============================= */}
            {/* Color Scheme (LOCKED) */}
            {/* ============================= */}
            <h5 className="mb-3 font-16 fw-semibold">Color Scheme</h5>
            <p className="text-muted small mb-3">Light (default)</p>

            {/* Dark option disabled */}
            {/*
            <input type="radio" />
            */}

            {/* ============================= */}
            {/* Topbar Color (LOCKED) */}
            {/* ============================= */}
            <h5 className="mb-3 font-16 fw-semibold">Topbar Color</h5>
            <p className="text-muted small mb-3">Light (default)</p>

            {/* Dark option disabled */}
            {/*
            <input type="radio" />
            */}

            {/* ============================= */}
            {/* Menu Color (LOCKED) */}
            {/* ============================= */}
            <h5 className="mb-3 font-16 fw-semibold">Menu Color</h5>
            <p className="text-muted small mb-3">Light (default)</p>

            {/* Dark option disabled */}
            {/*
            <input type="radio" />
            */}

            {/* ============================= */}
            {/* Sidebar Size (LOCKED) */}
            {/* ============================= */}
            <h5 className="mb-3 font-16 fw-semibold">Sidebar Size</h5>
            <p className="text-muted small mb-3">Hidden (default)</p>

            {/* Other sizes disabled */}
            {/*
            Default
            Condensed
            Small Hover
            Small Hover Active
            */}

          </div>
        </SimplebarReactClient>
      </OffcanvasBody>

      <div className="offcanvas-footer border-top p-3 text-center">
        <Row>
          <Col>
            {/* Reset kept intentionally in case admin wants later */}
            <Button variant="danger" onClick={resetSettings} className="w-100">
              Reset
            </Button>
          </Col>
        </Row>
      </div>
    </Offcanvas>
  );
};

export default ThemeCustomizer;
