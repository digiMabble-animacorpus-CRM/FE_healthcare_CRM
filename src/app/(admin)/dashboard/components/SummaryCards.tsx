"use client";

import { Card, Col, Row } from "react-bootstrap";
import { FaCalendarCheck, FaUsers, FaUserMd } from "react-icons/fa";

// =====================================================
// SINGLE COMPONENT WITH INDIVIDUAL SKELETON LOADING
// =====================================================
interface SummaryCardsProps {
    totalAppointments?: number;
    totalPatients?: number;
    totalTherapists?: number;
    loadingAppointments?: boolean;
    loadingPatients?: boolean;
    loadingTherapists?: boolean;
}

export default function SummaryCards({
    totalAppointments,
    totalPatients,
    totalTherapists,
    loadingAppointments = false,
    loadingPatients = false,
    loadingTherapists = false,
}: SummaryCardsProps) {
    
    const cards = [
        {
            label: "Appointments",
            value: totalAppointments,
            icon: <FaCalendarCheck />,
            themeColor: "#4169E1",
            bgColor: "rgba(65, 105, 225, 0.1)",
            isLoading: loadingAppointments,
        },
        {
            label: "Total Patients",
            value: totalPatients,
            icon: <FaUsers />,
            themeColor: "#20B2AA",
            bgColor: "rgba(32, 178, 170, 0.1)",
            isLoading: loadingPatients,
        },
        {
            label: "Therapists",
            value: totalTherapists,
            icon: <FaUserMd />,
            themeColor: "#FF7F50",
            bgColor: "rgba(255, 127, 80, 0.1)",
            isLoading: loadingTherapists,
        },
    ];

    return (
        <Row className="g-3 mb-4">
            {cards.map((card, index) => (
                <Col md={4} key={index}>
                    <Card 
                        className="p-3 shadow-lg border-0" 
                        style={{ backgroundColor: card.bgColor }}
                    >
                        <div className="d-flex justify-content-between align-items-center">
                            
                            {/* Left Text */}
                            <div className="text-dark">
                                <div className="text-uppercase mb-1 fw-medium" style={{ fontSize: 13 }}>
                                    {card.label}
                                </div>
                                
                                {/* Value with conditional skeleton */}
                                <div style={{ minHeight: 48 }}>
                                    {card.isLoading || card.value === undefined ? (
                                        <div className="placeholder-glow">
                                            <span 
                                                className="placeholder placeholder-lg"
                                                style={{ 
                                                    width: 80,
                                                    height: 40,
                                                    backgroundColor: `${card.themeColor}40`,
                                                    borderRadius: 6,
                                                }}
                                            ></span>
                                        </div>
                                    ) : (
                                        <div 
                                            className="fw-bolder" 
                                            style={{ 
                                                fontSize: 40, 
                                                color: card.themeColor,
                                                lineHeight: 1
                                            }}
                                        >
                                            {card.value.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Icon */}
                            <div 
                                className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ 
                                    backgroundColor: card.themeColor,
                                    color: 'white',
                                    fontSize: 26,
                                    width: 55,
                                    height: 55,
                                }}
                            >
                                {card.icon}
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}