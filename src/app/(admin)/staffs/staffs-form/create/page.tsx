'use client';

import { TeamType } from '@/assets/data/TeamType';
import React, { useState } from 'react';

type TeamFormProps = {
  onSubmitHandler: (formData: TeamType) => void;
};

const initialFormData: TeamType = {
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
  ID_Pro: '',
};

const TeamForm: React.FC<TeamFormProps> = ({ onSubmitHandler }) => {
  const [formData, setFormData] = useState<TeamType>(initialFormData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('Address.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        Address: {
          ...prev.Address,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitHandler(formData);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '15px',
    boxSizing: 'border-box',
    marginBottom: '0',
    backgroundColor: '#fafaff',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 600,
    fontSize: '14px',
    color: '#222',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '40px',
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(30,34,90,0.07)',
        padding: '40px 48px',
        maxWidth: '1300px',
        margin: '40px auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '36px' }}>
        Create New Team Member
      </h2>

      {/* Personal Information Section */}
      <section style={sectionStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: '18px' }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '28px' }}>
          <div>
            <label htmlFor="LastName" style={labelStyle}>
              Last Name *
            </label>
            <input
              id="LastName"
              name="LastName"
              value={formData.LastName}
              onChange={handleChange}
              placeholder="Enter last name"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="FirstName" style={labelStyle}>
              First Name *
            </label>
            <input
              id="FirstName"
              name="FirstName"
              value={formData.FirstName}
              onChange={handleChange}
              placeholder="Enter first name"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="PhoneNumber" style={labelStyle}>
              Phone Number *
            </label>
            <input
              id="PhoneNumber"
              name="PhoneNumber"
              value={formData.PhoneNumber}
              onChange={handleChange}
              placeholder="Enter phone"
              required
              type="tel"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="ContactMail" style={labelStyle}>
              Contact Email *
            </label>
            <input
              id="ContactMail"
              name="ContactMail"
              value={formData.ContactMail}
              onChange={handleChange}
              placeholder="Enter email"
              required
              type="email"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="Photo" style={labelStyle}>
              Photo URL
            </label>
            <input
              id="Photo"
              name="Photo"
              value={formData.Photo}
              onChange={handleChange}
              placeholder="Photo URL"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Professional Information Section */}
      <section style={sectionStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: '18px' }}>Professional Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          <div>
            <label htmlFor="Function" style={labelStyle}>
              Function
            </label>
            <input
              id="Function"
              name="Function"
              value={formData.Function}
              onChange={handleChange}
              placeholder="Function"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="PublicSpecific" style={labelStyle}>
              Public Specific
            </label>
            <input
              id="PublicSpecific"
              name="PublicSpecific"
              value={formData.PublicSpecific}
              onChange={handleChange}
              placeholder="Public specific"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="Specialisation" style={labelStyle}>
              Specialisation
            </label>
            <input
              id="Specialisation"
              name="Specialisation"
              value={formData.Specialisation}
              onChange={handleChange}
              placeholder="Specialisation"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="Function2" style={labelStyle}>
              Function 2
            </label>
            <input
              id="Function2"
              name="Function2"
              value={formData.Function2}
              onChange={handleChange}
              placeholder="Function 2"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="Function3" style={labelStyle}>
              Function 3
            </label>
            <input
              id="Function3"
              name="Function3"
              value={formData.Function3}
              onChange={handleChange}
              placeholder="Function 3"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="Function4" style={labelStyle}>
              Function 4
            </label>
            <input
              id="Function4"
              name="Function4"
              value={formData.Function4}
              onChange={handleChange}
              placeholder="Function 4"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Bio & Details Section */}
      <section style={sectionStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: '18px' }}>Bio & Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          <div>
            <label htmlFor="WhoAmI" style={labelStyle}>
              Who Am I
            </label>
            <textarea
              id="WhoAmI"
              name="WhoAmI"
              value={formData.WhoAmI}
              onChange={handleChange}
              placeholder="Describe yourself"
              rows={3}
              style={{ ...inputStyle, minHeight: '54px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label htmlFor="Consultations" style={labelStyle}>
              Consultations
            </label>
            <textarea
              id="Consultations"
              name="Consultations"
              value={formData.Consultations}
              onChange={handleChange}
              placeholder="Consultation details"
              rows={3}
              style={{ ...inputStyle, minHeight: '54px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label htmlFor="Hourly" style={labelStyle}>
              Hourly Rate
            </label>
            <input
              id="Hourly"
              name="Hourly"
              value={formData.Hourly}
              onChange={handleChange}
              placeholder="Hourly Rate"
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ marginTop: '26px' }}>
          <label htmlFor="About" style={labelStyle}>
            About
          </label>
          <textarea
            id="About"
            name="About"
            value={formData.About}
            onChange={handleChange}
            placeholder="About..."
            rows={4}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          />
        </div>
      </section>

      {/* Address Section */}
      <section style={sectionStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: '18px' }}>Address</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px' }}>
          <div>
            <label htmlFor="Address.street" style={labelStyle}>
              Street
            </label>
            <input
              id="Address.street"
              name="Address.street"
              value={formData.Address.street}
              onChange={handleChange}
              placeholder="Street"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="Address.city" style={labelStyle}>
              City
            </label>
            <input
              id="Address.city"
              name="Address.city"
              value={formData.Address.city}
              onChange={handleChange}
              placeholder="City"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="Address.zip_code" style={labelStyle}>
              Zip Code
            </label>
            <input
              id="Address.zip_code"
              name="Address.zip_code"
              value={formData.Address.zip_code}
              onChange={handleChange}
              placeholder="Zip Code"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="Address.country" style={labelStyle}>
              Country
            </label>
            <input
              id="Address.country"
              name="Address.country"
              value={formData.Address.country}
              onChange={handleChange}
              placeholder="Country"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Other Details Section */}
      <section style={sectionStyle}>
        <h3 style={{ fontWeight: 600, marginBottom: '18px' }}>Other Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px' }}>
          <div>
            <label htmlFor="LanguesParlees" style={labelStyle}>
              Langues parlées
            </label>
            <input
              id="LanguesParlees"
              name="LanguesParlees"
              value={formData.LanguesParlees}
              onChange={handleChange}
              placeholder="Langues parlées"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="PaymentMethod" style={labelStyle}>
              Payment Method
            </label>
            <input
              id="PaymentMethod"
              name="PaymentMethod"
              value={formData.PaymentMethod}
              onChange={handleChange}
              placeholder="Payment Method"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="DiplomasTrainings" style={labelStyle}>
              Diplomas and Trainings
            </label>
            <textarea
              id="DiplomasTrainings"
              name="DiplomasTrainings"
              value={formData.DiplomasTrainings}
              onChange={handleChange}
              placeholder="Diplomas and Trainings"
              rows={3}
              style={{ ...inputStyle, minHeight: '54px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label htmlFor="Specialisations" style={labelStyle}>
              Specialisations
            </label>
            <textarea
              id="Specialisations"
              name="Specialisations"
              value={formData.Specialisations}
              onChange={handleChange}
              placeholder="Specialisations"
              rows={3}
              style={{ ...inputStyle, minHeight: '54px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label htmlFor="Website" style={labelStyle}>
              Website
            </label>
            <input
              id="Website"
              name="Website"
              value={formData.Website}
              onChange={handleChange}
              placeholder="Website"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="FAQ" style={labelStyle}>
              FAQ
            </label>
            <textarea
              id="FAQ"
              name="FAQ"
              value={formData.FAQ}
              onChange={handleChange}
              placeholder="FAQ"
              rows={3}
              style={{ ...inputStyle, minHeight: '54px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label htmlFor="LiensAgenda" style={labelStyle}>
              Liens Agenda
            </label>
            <input
              id="LiensAgenda"
              name="LiensAgenda"
              value={formData.LiensAgenda}
              onChange={handleChange}
              placeholder="Liens Agenda"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div style={{ marginTop: '32px', textAlign: 'right' }}>
        <button
          type="submit"
          style={{
            backgroundColor: '#5119d2',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 42px',
            fontWeight: '700',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Create Team Member
        </button>
      </div>
    </form>
  );
};

export default TeamForm;
