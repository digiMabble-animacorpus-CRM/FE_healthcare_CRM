import React from 'react';

const profiles = [
    {
        ID_Pro: 'P001',
        Nom: 'Soufi',
        Prénom: 'Fouad',
        'Nom complet': 'Fouad Soufi',
        Fonction: 'Coach en développement personnel',
        'Public spécial': '',
        Spécialisations: 'Non-conventionn',
        Fonction_2: '',
        Fonction_3: '',
        Fonction_4: '',
        'Qui suis je': 'fouad.sou',
        Consultation: '0495/65.4',
        Adresse: 'Prise de',
        'contact email': '',
        'Contact téléphonique': '',
        Horaire: '',
        'À propos': 'Le coachin',
        'Langues parlées': 'Arabe',
        'Moyens de paiement': 'Payment C',
        'Diplômes / mes formations': 'coach cert',
        'Site web': 'https://rosa.be/fr/booking/hp/fouad-soufi/site/',
        'Foire aux questions': 'Les',
    },
    
];

const Field = ({
    label,
    value,
}: {
    label: string;
    value?: string;
}) =>
    value ? (
        <div style={{ marginBottom: '8px' }}>
            <strong>{label}:</strong>{' '}
            {label === 'Site web' ? (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {value}
                </a>
            ) : (
                value
            )}
        </div>
    ) : null;

const ProfileCard = ({
    profile,
}: {
    profile: typeof profiles[0];
}) => (
    <div
        style={{
            border: '1px solid #eee',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
    >
        <h2 style={{ marginBottom: '16px' }}>
            {profile['Nom complet']}
        </h2>
        <Field label="Fonction" value={profile['Fonction']} />
        <Field
            label="Public spécial"
            value={profile['Public spécial']}
        />
        <Field label="Consultation" value={profile['Consultation']} />
        <Field label="Adresse" value={profile['Adresse']} />
        <Field label="À propos" value={profile['À propos']} />
        <Field
            label="Langues parlées"
            value={profile['Langues parlées']}
        />
        <Field
            label="Moyens de paiement"
            value={profile['Moyens de paiement']}
        />
        <Field
            label="Diplômes / mes formations"
            value={profile['Diplômes / mes formations']}
        />
        <Field
            label="Spécialisations"
            value={profile['Spécialisations']}
        />
        <Field label="Site web" value={profile['Site web']} />
        <Field
            label="Foire aux questions"
            value={profile['Foire aux questions']}
        />
        <Field
            label="Contact email"
            value={profile['contact email']}
        />
        <Field
            label="Contact téléphonique"
            value={profile['Contact téléphonique']}
        />
        <Field label="Horaire" value={profile['Horaire']} />
        <Field label="Fonction 2" value={profile['Fonction_2']} />
        <Field label="Fonction 3" value={profile['Fonction_3']} />
        <Field label="Fonction 4" value={profile['Fonction_4']} />
        <Field label="Qui suis je" value={profile['Qui suis je']} />
    </div>
);

const ProfileDetail = () => (
    <div
        style={{
            maxWidth: 700,
            margin: '0 auto',
            padding: '32px 0',
        }}
    >
        {profiles.map((profile) => (
            <ProfileCard key={profile.ID_Pro} profile={profile} />
        ))}
    </div>
);

export default ProfileDetail;