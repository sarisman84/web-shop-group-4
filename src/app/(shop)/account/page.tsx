import { getUserProfile } from '@/lib/data/userdata';
import { redirect } from 'next/navigation';
import AccountClient from './AccountClient'; // Make sure the path matches where your client file is

export default async function AccountPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect('/auth/login?redirect=/account');
  }

  return <AccountClient initialProfile={profile} />;
}