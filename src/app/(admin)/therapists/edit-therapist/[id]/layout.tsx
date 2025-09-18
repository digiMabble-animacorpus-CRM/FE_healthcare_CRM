import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Therapist' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
