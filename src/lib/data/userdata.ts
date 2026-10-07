import { createClient } from '@/lib/supabaseServer';

export interface UserProfile {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  fullPhoneNumber: string;
  streetAddress: string;
  city: string;
  country: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const meta = user.user_metadata || {};

  return {
    id: user.id,
    email: user.email,
    firstName: meta.first_name || '',
    lastName: meta.last_name || '',
    fullName: meta.full_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim(),
    countryCode: meta.country_code || '+46',
    phoneNumber: meta.phone_number || '',
    fullPhoneNumber: meta.full_phone_number || '',
    streetAddress: meta.street_address || '',
    city: meta.city || '',
    country: meta.country || '',
  };
}