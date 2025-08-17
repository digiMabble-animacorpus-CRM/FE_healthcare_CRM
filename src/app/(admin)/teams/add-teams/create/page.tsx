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
  ID_Pro: ''
};

const TeamForm: React.FC<TeamFormProps> = ({ onSubmitHandler }) => {
  const [formData, setFormData] = useState<TeamType>(initialFormData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 12px rgba(30,34,90,0.09)',
    padding: '42px',
    width: '100%',
    maxWidth: '1300px',
    margin: '42px auto',
    fontFamily: 'system-ui,sans-serif',
  };
  const sectionStyle: React.CSSProperties = { marginBottom: '38px' };
  const headingStyle: React.CSSProperties = { fontWeight: 600, marginBottom: '18px', fontSize: '18px' };
  const labelStyle: React.CSSProperties = { fontWeight: 500, marginBottom: '7px', display: 'block', color: '#222' };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #cacaca',
    fontSize: '15px',
    marginBottom: '0',
    boxSizing: 'border-box',
    background: '#fafaff',
  };
  const buttonBarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '38px',
  };
  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#5119d2',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '11px 36px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
  };
  const cancelButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#eee',
    color: '#5119d2',
    border: '1px solid #5119d2',
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '32px' }}>Create New Team Member</h2>

      {/* PERSONAL INFORMATION */}
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
          <div>
            <label style={labelStyle}>Last Name *</label>
            <input name="LastName" value={formData.LastName} onChange={handleChange} style={inputStyle} placeholder="Enter last name" required />
          </div>
          <div>
            <label style={labelStyle}>First Name *</label>
            <input name="FirstName" value={formData.FirstName} onChange={handleChange} style={inputStyle} placeholder="Enter first name" required />
          </div>
          <div>
            <label style={labelStyle}>Full Name (Nom complet)</label>
            <input name="NomComplet" value={formData.NomComplet} onChange={handleChange} style={inputStyle} placeholder="Enter full name" />
          </div>
          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} style={inputStyle} placeholder="Enter phone" required type="tel" />
          </div>
          <div>
            <label style={labelStyle}>Contact Email *</label>
            <input name="ContactMail" value={formData.ContactMail} onChange={handleChange} style={inputStyle} placeholder="Enter email" required type="email" />
          </div>
          <div>
            <label style={labelStyle}>Photo URL</label>
            <input name="Photo" value={formData.Photo} onChange={handleChange} style={inputStyle} placeholder="Photo URL" />
          </div>
        </div>
      </section>

      {/* PROFESSIONAL INFORMATION */}
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Professional Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '28px' }}>
          <div>
            <label style={labelStyle}>Function</label>
            <input name="Function" value={formData.Function} onChange={handleChange} style={inputStyle} placeholder="Function" />
          </div>
          <div>
            <label style={labelStyle}>Public Specific</label>
            <input name="PublicSpecific" value={formData.PublicSpecific} onChange={handleChange} style={inputStyle} placeholder="Public specific" />
          </div>
          <div>
            <label style={labelStyle}>Specialisation</label>
            <input name="Specialisation" value={formData.Specialisation} onChange={handleChange} style={inputStyle} placeholder="Specialisation" />
          </div>
          <div>
            <label style={labelStyle}>Function 2</label>
            <input name="Function2" value={formData.Function2} onChange={handleChange} style={inputStyle} placeholder="Function 2" />
          </div>
          <div>
            <label style={labelStyle}>Function 3</label>
            <input name="Function3" value={formData.Function3} onChange={handleChange} style={inputStyle} placeholder="Function 3" />
          </div>
          <div>
            <label style={labelStyle}>Function 4</label>
            <input name="Function4" value={formData.Function4} onChange={handleChange} style={inputStyle} placeholder="Function 4" />
          </div>
        </div>
      </section>

      {/* BIO & DETAILS */}
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Bio & Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '28px' }}>
          <div>
            <label style={labelStyle}>Who Am I</label>
            <textarea name="WhoAmI" value={formData.WhoAmI} onChange={handleChange} style={{ ...inputStyle, minHeight: 54, resize: 'vertical' }} placeholder="Describe yourself" rows={2} />
          </div>
          <div>
            <label style={labelStyle}>Consultations</label>
            <textarea name="Consultations" value={formData.Consultations} onChange={handleChange} style={{ ...inputStyle, minHeight: 54, resize: 'vertical' }} placeholder="Consultation details" rows={2} />
          </div>
          <div>
            <label style={labelStyle}>Hourly Rate</label>
            <input name="Hourly" value={formData.Hourly} onChange={handleChange} style={inputStyle} placeholder="Hourly Rate" />
          </div>
        </div>
        <div style={{ marginTop: '22px' }}>
          <label style={labelStyle}>About</label>
          <textarea name="About" value={formData.About} onChange={handleChange} style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} placeholder="About..." rows={3} />
        </div>
      </section>

      {/* ADDRESS */}
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Address</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '28px' }}>
          <div>
            <label style={labelStyle}>Street</label>
            <input name="Address.street" value={formData.Address.street} onChange={handleChange} style={inputStyle} placeholder="Street" />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input name="Address.city" value={formData.Address.city} onChange={handleChange} style={inputStyle} placeholder="City" />
          </div>
          <div>
            <label style={labelStyle}>Zip Code</label>
            <input name="Address.zip_code" value={formData.Address.zip_code} onChange={handleChange} style={inputStyle} placeholder="Zip Code" />
          </div>
          <div>
            <label style={labelStyle}>Country</label>
            <input name="Address.country" value={formData.Address.country} onChange={handleChange} style={inputStyle} placeholder="Country" />
          </div>
        </div>
      </section>

      {/* OTHER DETAILS */}
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Other Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '28px' }}>
          <div>
            <label style={labelStyle}>Langues parlées</label>
            <input name="LanguesParlees" value={formData.LanguesParlees} onChange={handleChange} style={inputStyle} placeholder="Langues parlées" />
          </div>
          <div>
            <label style={labelStyle}>Payment Method</label>
            <input name="PaymentMethod" value={formData.PaymentMethod} onChange={handleChange} style={inputStyle} placeholder="Payment Method" />
          </div>
          <div>
            <label style={labelStyle}>Diplomas and Trainings</label>
            <textarea name="DiplomasTrainings" value={formData.DiplomasTrainings} onChange={handleChange} style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} placeholder="Diplomas and Trainings" />
          </div>
          <div>
            <label style={labelStyle}>Specialisations</label>
            <textarea name="Specialisations" value={formData.Specialisations} onChange={handleChange} style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} placeholder="Specialisations" />
          </div>
          <div>
            <label style={labelStyle}>Website</label>
            <input name="Website" value={formData.Website} onChange={handleChange} style={inputStyle} placeholder="Website" />
          </div>
          <div>
            <label style={labelStyle}>FAQ</label>
            <textarea name="FAQ" value={formData.FAQ} onChange={handleChange} style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} placeholder="FAQ" />
          </div>
          <div>
            <label style={labelStyle}>Liens Agenda</label>
            <input name="LiensAgenda" value={formData.LiensAgenda} onChange={handleChange} style={inputStyle} placeholder="Liens Agenda" />
          </div>
        </div>
      </section>

      <div style={buttonBarStyle}>
        <button type="button" style={cancelButtonStyle} onClick={() => window.history.back()}>Cancel</button>
        <button type="submit" style={buttonStyle}>Create Team Member</button>
      </div>
    </form>
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmitHandler(formData);
  }
};

export default TeamForm;
