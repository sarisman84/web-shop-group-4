'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

// Shadcn UI components imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+46'); // Standard till Sverige (+46)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Sverige');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(t('passwordMin'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwordMatch'));
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          country_code: countryCode,
          phone_number: phoneNumber,
          full_phone_number: `${countryCode} ${phoneNumber}`,
          street_address: streetAddress,
          city,
          country,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push('/auth/login?registered=true');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
          <CardDescription>{t('registerDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* För- och efternamn */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('firstName')}</Label>
                <Input 
                  id="firstName" 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('lastName')}</Label>
                <Input 
                  id="lastName" 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* E-post */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            {/* Landskod och telefonnummer */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t('phone')}</Label>
              <div className="flex gap-2">
                <select 
                  value={countryCode} 
                  onChange={(e) => setCountryCode(e.target.value)} 
                  className="flex h-9 w-27.5 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="+46">{t('countries.se')} (+46)</option>
                  <option value="+47">{t('countries.no')} (+47)</option>
                  <option value="+45">{t('countries.dk')} (+45)</option>
                  <option value="+358">{t('countries.fi')} (+358)</option>
                  <option value="+44">{t('countries.gb')} (+44)</option>
                  <option value="+1">{t('countries.us')} (+1)</option>
                  <option value="+92">{t('countries.pk')} (+92)</option>
                  <option value="+91">{t('countries.in')} (+91)</option>
                </select>
                <Input 
                  id="phoneNumber" 
                  type="tel" 
                  placeholder="701234567" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Adressuppgifter (Gata, stad, land) */}
            <div className="space-y-2">
              <Label htmlFor="streetAddress">{t('streetAddress')}</Label>
              <Input 
                id="streetAddress" 
                type="text" 
                placeholder={t('streetPlaceholder')} 
                value={streetAddress} 
                onChange={(e) => setStreetAddress(e.target.value)} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="city">{t('city')}</Label>
                <Input 
                  id="city" 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t('country')}</Label>
                <Input 
                  id="country" 
                  type="text" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Lösenord */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordHint')}</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('creating') : t('submitRegister')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}