import { createClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/account');
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold">My Account</h1>
      <p className="mt-4">Welcome back, {user.email}!</p>
    </div>
  );
}