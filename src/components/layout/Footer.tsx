import React from 'react'
import IconifyIcon from '../wrappers/IconifyIcon'
import { Col, Container, Row } from 'react-bootstrap'
import Link from 'next/link'
import { currentYear } from '@/context/constants'

const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid>
        <Row>
          <Col xs={12} className="text-center">
            {currentYear} © Anima Corpus. Crafted by <IconifyIcon icon="solar:hearts-bold-duotone" className="fs-18 align-middle text-danger" />{' '}
            <Link href="" className="fw-bold footer-text" target="_blank">
              Digi Mabble
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
