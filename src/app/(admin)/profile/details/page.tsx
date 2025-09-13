'use client';

import PageTitle from '@/components/PageTitle';
import ProfileDetails from './[id]/components/ProfileDetails';

interface ProfileData {
  ID_Pro: string;
  Nom: string;
  Prénom: string;
  'Nom complet': string;
  Fonction: string;
  'Public spécial': string;
  Spécialisations: string;
  'Fonction 2': string;
  'Fonction 3': string;
  'Fonction 4': string;
  'Qui suis je': string;
  Consultation: string;
  Adresse: string;
  'contact email': string;
  'Contact téléphonique': string;
  Horaire: string;
  'À propos': string;
  'Langues parlées': string;
  'Moyens de paiement': string;
  'Diplômes / mes formations': string;
  'Site web': string;
  'Foire aux questions': string;
}

const ProfileDetailsPage = () => {
  return (
    <>
      <PageTitle subName="Profile" title="Profile" />
      <ProfileDetails />
    </>
  );
};

export default ProfileDetailsPage;
