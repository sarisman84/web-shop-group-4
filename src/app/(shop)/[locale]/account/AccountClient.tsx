'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { UserProfile } from '@/lib/data/userdata';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function AccountClient({ initialProfile }: { initialProfile: UserProfile }) {
  const t = useTranslations('account');
  const tAuth = useTranslations('auth');
  const tReviews = useTranslations('reviews');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // Formulärstate
  const [firstName, setFirstName] = useState(initialProfile?.firstName || '');
  const [lastName, setLastName] = useState(initialProfile?.lastName || '');
  const [countryCode, setCountryCode] = useState(initialProfile?.countryCode || '+46');
  const [phoneNumber, setPhoneNumber] = useState(initialProfile?.phoneNumber || '');
  const [streetAddress, setStreetAddress] = useState(initialProfile?.streetAddress || '');
  const [city, setCity] = useState(initialProfile?.city || '');
  const [country, setCountry] = useState(initialProfile?.country || 'Sverige');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        country_code: countryCode,
        phone_number: phoneNumber,
        full_phone_number: `${countryCode} ${phoneNumber}`.trim(),
        street_address: streetAddress,
        city,
        country,
      },
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccessMessage(t('updated'));
      setIsEditing(false);
      router.refresh(); // Uppdaterar serverkomponentens data
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/account/addresses" className={buttonVariants({ variant: "outline" })}>
            {t('addresses')}
          </Link>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              {t('edit')}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md font-medium">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/15 text-emerald-700 text-sm p-3 rounded-md font-medium">
          {successMessage}
        </div>
      )}

      {isEditing ? (
        /* REDIGERINGSLÄGE */
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('editPersonalTitle')}</CardTitle>
                <CardDescription>{t('editPersonalDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{tAuth('firstName')}</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{tAuth('lastName')}</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('emailLocked')}</Label>
                  <Input id="email" value={initialProfile.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{tAuth('phone')}</Label>
                  <div className="flex gap-2">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)} 
                      className="flex h-9 w-28 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="+46">{tAuth('countries.se')} (+46)</option>
                      <option value="+47">{tAuth('countries.no')} (+47)</option>
                      <option value="+45">{tAuth('countries.dk')} (+45)</option>
                      <option value="+358">{tAuth('countries.fi')} (+358)</option>
                      <option value="+44">{tAuth('countries.gb')} (+44)</option>
                      <option value="+1">{tAuth('countries.us')} (+1)</option>
                    </select>
                    <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('editAddressTitle')}</CardTitle>
                <CardDescription>{t('editAddressDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">{tAuth('streetAddress')}</Label>
                  <Input id="streetAddress" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{tAuth('city')}</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{tAuth('country')}</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      ) : (
        /* VY-LÄGE */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('personalTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{t('fullName')}</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.fullName || t('notProvided')}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{t('emailAddress')}</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.email}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{tAuth('phone')}</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.fullPhoneNumber || t('notProvided')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('addressTitle')}</CardTitle>
              <CardDescription>{t('addressDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{tAuth('streetAddress')}</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.streetAddress || t('notProvided')}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{tAuth('city')}</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.city || t('notProvided')}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{tAuth('country')}</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.country || t('notProvided')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Link 
        href="/" 
        className={`${buttonVariants({ variant: "outline" })} bg-gray-100 hover:bg-gray-300 text-gray-900`}
      >
        {tReviews('backToShop')}
      </Link>
    </div>
  );
}