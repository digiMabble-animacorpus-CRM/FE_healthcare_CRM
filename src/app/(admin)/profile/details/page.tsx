import PageTitle from '@/components/PageTitle';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Welcome' };

const ProfilePage = () => {
  return (
    <>
      <PageTitle title="My Profile" subName="Pages" />
    </>
  );
};

export default ProfilePage;
