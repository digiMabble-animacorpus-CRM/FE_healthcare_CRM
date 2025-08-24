'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProfileById } from '@/helpers/profile';
import ProfileDetails from './[id]/components/ProfileDetails';
import { useRouter } from 'next/router';
import axios from 'axios';

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
//   const { id } = useParams();
//   const [data, setData] = useState<ProfileData | null>(null);
//   const [loading, setLoading] = useState(true);


  return (
    <>
      <PageTitle subName="Profile" title="Profile" />
      <ProfileDetails
        // id={data.ID_Pro}
        // name={data['Nom complet']}
        // fonction={data.Fonction}
        // email={data['contact email']}
        // phone={data['Contact téléphonique']}
        // address={data.Adresse}
        // apropos={data['À propos']}
        // langues={data['Langues parlées']}
        // paiement={data['Moyens de paiement']}
        // diplomes={data['Diplômes / mes formations']}
        // site={data['Site web']}
        // faq={data['Foire aux questions']}
      />
    </>
  );
};

export default ProfileDetailsPage;
