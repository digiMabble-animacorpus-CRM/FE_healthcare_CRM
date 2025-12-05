"use client";

import { Card, Col, Row } from "react-bootstrap";
import { FaCalendarCheck, FaUsers, FaUserMd } from "react-icons/fa"; 

// =====================================================
// SKELETON (unchanged)
// =====================================================
export function SummaryCardsSkeleton() {
    return (
        <Row className="g-3 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <Col md={4} key={i}>
                    <Card className="p-3 shadow-sm">
                        <div className="placeholder-wave">
                            <div className="placeholder col-6 mb-3" style={{ height: 20 }}></div>
                            <div className="placeholder col-8 mb-2" style={{ height: 28 }}></div>
                            <div className="placeholder col-4" style={{ height: 18 }}></div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

// =====================================================
// COMPONENT
// =====================================================
interface SummaryCardProps {
    totalAppointments: number;
    totalPatients: number;
    totalTherapists: number;
}

export default function SummaryCards({
    totalAppointments,
    totalPatients,
    totalTherapists,
}: SummaryCardProps) {
    
    const cards = [
        {
            label: "Appointments",
            value: totalAppointments.toLocaleString(),
            icon: <FaCalendarCheck />,
            themeColor: "#4169E1",
            bgColor: "rgba(65, 105, 225, 0.1)",
        },
        {
            label: "Total Patients",
            value: totalPatients.toLocaleString(),
            icon: <FaUsers />,
            themeColor: "#20B2AA",
            bgColor: "rgba(32, 178, 170, 0.1)",
        },
        {
            label: "Therapists",
            value: totalTherapists.toLocaleString(),
            icon: <FaUserMd />,
            themeColor: "#FF7F50",
            bgColor: "rgba(255, 127, 80, 0.1)",
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
                                <div 
                                    className="fw-bolder" 
                                    style={{ fontSize: 40, color: card.themeColor }}
                                >
                                    {card.value}
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
