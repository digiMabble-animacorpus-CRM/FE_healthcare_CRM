"use client";

import { TeamType } from "@/assets/data/TeamType";
import React, { useState } from "react";

type TeamFormProps = {
  onSubmitHandler: (formData: TeamType) => void;
};

const initialFormData: TeamType = {
  // No ID_Pro
  LastName: "",
  FirstName: "",
  NomComplet: "",
  Function: "",
  PublicSpecific: "",
  Specialisation: "",
  Function2: "",
  Function3: "",
  Function4: "",
  WhoAmI: "",
  Consultations: "",
  Address: {
    street: "",
    city: "",
    zip_code: "",
    country: "",
  },
  ContactMail: "",
  PhoneNumber: "",
  Hourly: "",
  About: "",
  LanguesParlees: "",
  PaymentMethod: "",
  DiplomasTrainings: "",
  Specialisations: "",
  Website: "",
  FAQ: "",
  LiensAgenda: "",
  Photo: "",
  ID_Pro: ""
};

export const TeamForm: React.FC<TeamFormProps> = ({ onSubmitHandler }) => {
  const [formData, setFormData] = useState<TeamType>(initialFormData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("Address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        Address: {
          ...prev.Address,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitHandler(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "10px",
        gridTemplateColumns: "repeat(6, 1fr)",
        padding: "2rem",
        background: "white",
        borderRadius: "10px",
        maxWidth: "1200px",
        margin: "24px auto",
      }}
    >
      {/* Top Row */}
      <input
        name="LastName"
        value={formData.LastName}
        onChange={handleChange}
        placeholder="Last Name"
      />
      <input
        name="FirstName"
        value={formData.FirstName}
        onChange={handleChange}
        placeholder="First Name"
      />
      <input
        name="NomComplet"
        value={formData.NomComplet}
        onChange={handleChange}
        placeholder="Nom complet"
      />
      <input
        name="Function"
        value={formData.Function}
        onChange={handleChange}
        placeholder="Function"
      />
      <input
        name="PublicSpecific"
        value={formData.PublicSpecific}
        onChange={handleChange}
        placeholder="Public specific"
      />
      <input
        name="Specialisation"
        value={formData.Specialisation}
        onChange={handleChange}
        placeholder="Specialisation"
      />

      {/* Second Row */}
      <input
        name="Function2"
        value={formData.Function2}
        onChange={handleChange}
        placeholder="Function 2"
      />
      <input
        name="Function3"
        value={formData.Function3}
        onChange={handleChange}
        placeholder="Function 3"
      />
      <input
        name="Function4"
        value={formData.Function4}
        onChange={handleChange}
        placeholder="Function 4"
      />
      <textarea
        name="WhoAmI"
        value={formData.WhoAmI}
        onChange={handleChange}
        placeholder="Who Am I"
        style={{ gridColumn: "span 1" }}
        rows={2}
      />
      <textarea
        name="Consultations"
        value={formData.Consultations}
        onChange={handleChange}
        placeholder="Consultations"
        style={{ gridColumn: "span 2" }}
        rows={2}
      />

      {/* Address Row - 6 columns */}
      <label
        style={{
          gridColumn: "1 / 7",
          fontWeight: "bold",
          marginTop: "1rem",
        }}
      >
        Address:
      </label>
      <input
        name="Address.street"
        value={formData.Address.street}
        onChange={handleChange}
        placeholder="Street"
        style={{ gridColumn: "1 / 2" }}
      />
      <input
        name="Address.city"
        value={formData.Address.city}
        onChange={handleChange}
        placeholder="City"
        style={{ gridColumn: "2 / 3" }}
      />
      <input
        name="Address.zip_code"
        value={formData.Address.zip_code}
        onChange={handleChange}
        placeholder="Zip Code"
        style={{ gridColumn: "3 / 4" }}
      />
      <input
        name="Address.country"
        value={formData.Address.country}
        onChange={handleChange}
        placeholder="Country"
        style={{ gridColumn: "4 / 5" }}
      />
      <input
        name="ContactMail"
        value={formData.ContactMail}
        onChange={handleChange}
        placeholder="Contact Email"
        type="email"
        style={{ gridColumn: "5 / 6" }}
      />
      <input
        name="PhoneNumber"
        value={formData.PhoneNumber}
        onChange={handleChange}
        placeholder="Phone Number"
        type="tel"
        style={{ gridColumn: "6 / 7" }}
      />

      {/* Next row */}
      <input
        name="Hourly"
        value={formData.Hourly}
        onChange={handleChange}
        placeholder="Hourly Rate"
        style={{ gridColumn: "1 / 2" }}
      />
      <textarea
        name="About"
        value={formData.About}
        onChange={handleChange}
        placeholder="About"
        rows={2}
        style={{ gridColumn: "2 / 4" }}
      />
      <input
        name="LanguesParlees"
        value={formData.LanguesParlees}
        onChange={handleChange}
        placeholder="Langues parlées"
        style={{ gridColumn: "4 / 5" }}
      />
      <input
        name="PaymentMethod"
        value={formData.PaymentMethod}
        onChange={handleChange}
        placeholder="Payment Method"
        style={{ gridColumn: "5 / 6" }}
      />

      {/* Diplomas/Trainings/Specialisations/etc row */}
      <textarea
        name="DiplomasTrainings"
        value={formData.DiplomasTrainings}
        onChange={handleChange}
        placeholder="Diplomas and Trainings"
        rows={2}
        style={{ gridColumn: "1 / 3" }}
      />
      <textarea
        name="Specialisations"
        value={formData.Specialisations}
        onChange={handleChange}
        placeholder="Specialisations"
        rows={2}
        style={{ gridColumn: "3 / 4" }}
      />
      <input
        name="Website"
        value={formData.Website}
        onChange={handleChange}
        placeholder="Website"
        style={{ gridColumn: "4 / 5" }}
      />
      <textarea
        name="FAQ"
        value={formData.FAQ}
        onChange={handleChange}
        placeholder="FAQ"
        rows={2}
        style={{ gridColumn: "5 / 6" }}
      />
      <input
        name="LiensAgenda"
        value={formData.LiensAgenda}
        onChange={handleChange}
        placeholder="Liens Agenda"
        style={{ gridColumn: "6 / 7" }}
      />
      <input
        name="Photo"
        value={formData.Photo}
        onChange={handleChange}
        placeholder="Photo URL"
        style={{ gridColumn: "1 / 3" }}
      />

      {/* Button */}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        style={{ gridColumn: "1 / 3", marginTop: "12px" }}
      >
        Create Team Member
      </button>
    </form>
  );
};

export default TeamForm;
