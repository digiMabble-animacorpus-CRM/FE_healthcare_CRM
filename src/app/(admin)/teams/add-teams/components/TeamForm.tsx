'use client';

import React, { useState } from 'react';

type TeamFormProps = {
  onSubmitHandler: (formData: any) => void;
};

const TeamForm: React.FC<TeamFormProps> = ({ onSubmitHandler }) => {
  const [formData, setFormData] = useState({
    ID_Pro: '',
    LastName: '',
    FirstName: '',
    NomComplet: '',
    Function: '',
    PublicSpecific: '',
    Specialisation: '',
    Function2: '',
    Function3: '',
    Function4: '',
    WhoAmI: '',
    Consultations: '',
    Address: {
      street: '',
      city: '',
      zip_code: '',
      country: '',
    },
    ContactMail: '',
    PhoneNumber: '',
    Hourly: '',
    About: '',
    LanguesParlees: '',
    PaymentMethod: '',
    DiplomasTrainings: '',
    Specialisations: '',
    Website: '',
    FAQ: '',
    LiensAgenda: '',
    Photo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Nested object for Address
    if (name.startsWith("Address.")) {
      const key = name.split(".")[1]; // "street", "city", "zip_code", "country"
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
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input name="ID_Pro" value={formData.ID_Pro} onChange={handleChange} placeholder="ID Pro" />
      <input name="LastName" value={formData.LastName} onChange={handleChange} placeholder="Last Name" />
      <input name="FirstName" value={formData.FirstName} onChange={handleChange} placeholder="First Name" />
      <input name="NomComplet" value={formData.NomComplet} onChange={handleChange} placeholder="Nom complet" />
      <input name="Function" value={formData.Function} onChange={handleChange} placeholder="Function" />
      <input name="PublicSpecific" value={formData.PublicSpecific} onChange={handleChange} placeholder="Public specific" />
      <input name="Specialisation" value={formData.Specialisation} onChange={handleChange} placeholder="Specialisation" />
      <input name="Function2" value={formData.Function2} onChange={handleChange} placeholder="Function 2" />
      <input name="Function3" value={formData.Function3} onChange={handleChange} placeholder="Function 3" />
      <input name="Function4" value={formData.Function4} onChange={handleChange} placeholder="Function 4" />
      <textarea name="WhoAmI" value={formData.WhoAmI} onChange={handleChange} placeholder="Who Am I" />
      <textarea name="Consultations" value={formData.Consultations} onChange={handleChange} placeholder="Consultations" />

      <h4>Address:</h4>
      <input name="Address.street" value={formData.Address.street} onChange={handleChange} placeholder="Street" />
      <input name="Address.city" value={formData.Address.city} onChange={handleChange} placeholder="City" />
      <input name="Address.zip_code" value={formData.Address.zip_code} onChange={handleChange} placeholder="Zip Code" />
      <input name="Address.country" value={formData.Address.country} onChange={handleChange} placeholder="Country" />

      <input name="ContactMail" value={formData.ContactMail} onChange={handleChange} placeholder="Contact Email" type="email" />
      <input name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} placeholder="Phone Number" type="tel" />
      <input name="Hourly" value={formData.Hourly} onChange={handleChange} placeholder="Hourly Rate" />
      <textarea name="About" value={formData.About} onChange={handleChange} placeholder="About" />
      <input name="LanguesParlees" value={formData.LanguesParlees} onChange={handleChange} placeholder="Langues parlées" />
      <input name="PaymentMethod" value={formData.PaymentMethod} onChange={handleChange} placeholder="Payment Method" />
      <textarea name="DiplomasTrainings" value={formData.DiplomasTrainings} onChange={handleChange} placeholder="Diplomas and Trainings" />
      <textarea name="Specialisations" value={formData.Specialisations} onChange={handleChange} placeholder="Specialisations" />
      <input name="Website" value={formData.Website} onChange={handleChange} placeholder="Website" />
      <textarea name="FAQ" value={formData.FAQ} onChange={handleChange} placeholder="FAQ" />
      <input name="LiensAgenda" value={formData.LiensAgenda} onChange={handleChange} placeholder="Liens Agenda" />
      <input name="Photo" value={formData.Photo} onChange={handleChange} placeholder="Photo URL" />

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Create Team Member
      </button>
    </form>
  );
};

export default TeamForm;
