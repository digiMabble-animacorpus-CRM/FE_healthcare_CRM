"use client";

import { useState, useEffect } from "react";
import type { CustomerEnquiriesType } from "@/types/data";
import dynamic from "next/dynamic";

// Dynamically import client-only components
const CustomerInfoCard = dynamic(() => import("./components/CustomerInfoCard"), {
    ssr: false,
});
const BookAppointmentForm = dynamic(() => import("./components/BookAppointmentForm"), {
    ssr: false,
});

interface UserType {
    team_id: string | number;
    // Add other user properties you might need
}

export default function AppointmentPage() {
    const [customer, setCustomer] = useState<CustomerEnquiriesType | null>(null);
    const [user, setUser] = useState<UserType | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Only run on client
    useEffect(() => {
        setIsClient(true);

        const userString = localStorage.getItem("user");
        if (userString) {
            try {
                setUser(JSON.parse(userString));
            } catch (err) {
                console.error("Failed to parse user from localStorage", err);
            }
        }
    }, []);

    const handleCustomerSave = (saved: CustomerEnquiriesType) => {
        setCustomer(saved);
    };

    const handleAppointmentSubmit = (appointmentData: any) => {
        console.log("Appointment Data:", appointmentData);
        alert("Appointment submitted successfully!");
    };

    if (!isClient) return null; // Avoid SSR rendering

    return (
        <div className="p-3">
            <CustomerInfoCard onSave={handleCustomerSave} />

            {(customer?._id || "cc3fa39e-8e2e-4c89-8911-667c3df7eb7d") && (
                <BookAppointmentForm
                    patientId={customer?._id || "cc3fa39e-8e2e-4c89-8911-667c3df7eb7d"}
                    createdById={user?.team_id ? String(user.team_id) : ""}
                    onSubmitHandler={handleAppointmentSubmit}
                    selectedCustomer={customer || undefined}
                />
            )}
        </div>
    );
}
