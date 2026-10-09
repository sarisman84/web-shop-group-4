'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { UserProfile } from '@/lib/data/userdata';
import { COUNTRY_CODES } from '@/lib/country-codes';

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

  const [firstName, setFirstName] = useState(initialProfile?.firstName || '');
  const [lastName, setLastName] = useState(initialProfile?.lastName || '');
  const [countryCode, setCountryCode] = useState(initialProfile?.countryCode || '+46');
  const [phoneNumber, setPhoneNumber] = useState(initialProfile?.phoneNumber || '');
  const [streetAddress, setStreetAddress] = useState(initialProfile?.streetAddress || '');
  const [city, setCity] = useState(initialProfile?.city || '');
  const [country, setCountry] = useState(initialProfile?.country || 'Sverige');

  // Back to the saved values, e.g. when the visitor cancels an edit.
  const resetForm = () => {
    setFirstName(initialProfile?.firstName || '');
    setLastName(initialProfile?.lastName || '');
    setCountryCode(initialProfile?.countryCode || '+46');
    setPhoneNumber(initialProfile?.phoneNumber || '');
    setStreetAddress(initialProfile?.streetAddress || '');
    setCity(initialProfile?.city || '');
    setCountry(initialProfile?.country || 'Sverige');
    setError('');
  };

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
      router.refresh();
    }
  };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || initialProfile?.email?.[0] || 'U'}`.toUpperCase();

  return (
    <main id="main-content" className="max-w-3xl mx-auto mt-10 p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/account/addresses" className={`${buttonVariants({ variant: "outline" })} border-gray-300`}>
            {t('addresses')}
          </Link>
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="gap-2 bg-gray-900 hover:bg-gray-700 text-white border-0 shadow-sm"
            >
              <Edit3 className="w-4 h-4" /> {t('edit')}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-destructive/15 text-destructive text-sm p-3 rounded-md font-medium">
          {error}
        </div>
      )}

      {successMessage && (
        <div role="status" className="bg-emerald-500/15 text-emerald-700 text-sm p-3 rounded-md font-medium">
          {successMessage}
        </div>
      )}

      {isEditing ? (
        /* EDIT MODE */
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle role="heading" aria-level={2}>{t('editPersonalTitle')}</CardTitle>
                <CardDescription>{t('editPersonalDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{tAuth('firstName')}</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{tAuth('lastName')}</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="bg-background" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('emailLocked')}</Label>
                    <Input id="email" value={initialProfile.email} disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{tAuth('phone')}</Label>
                  <div className="flex gap-2">
                    <select 
                      aria-label={tAuth('countryCode')}
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)} 
                      className="flex h-9 w-28 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {COUNTRY_CODES.map(({ code, key }) => (
                        <option key={code} value={code}>{tAuth(`countries.${key}`)} ({code})</option>
                      ))}
                      {/* A saved code that is not in the list must still be shown. */}
                      {!COUNTRY_CODES.some(({ code }) => code === countryCode) && (
                        <option value={countryCode}>{countryCode}</option>
                      )}
                    </select>
                    <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle role="heading" aria-level={2}>{t('editAddressTitle')}</CardTitle>
                <CardDescription>{t('editAddressDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">{tAuth('streetAddress')}</Label>
                    <Input id="streetAddress" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{tAuth('city')}</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{tAuth('country')}</Label>
                    <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required className="bg-background" />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => { resetForm(); setIsEditing(false); }}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[130px]">
              {loading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      ) : (
        /* VY-LÄGE */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle role="heading" aria-level={2}>{t('personalTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-sm flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{t('fullName')}</span>
                    <p className="text-foreground font-medium mt-0.5">{initialProfile.fullName || <span className="text-muted-foreground italic">{t('notProvided')}</span>}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{t('emailAddress')}</span>
                    <p className="text-foreground font-medium mt-0.5">{initialProfile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{tAuth('phone')}</span>
                    <p className="text-foreground font-medium mt-0.5">{initialProfile.fullPhoneNumber || <span className="text-muted-foreground italic">{t('notProvided')}</span>}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle role="heading" aria-level={2}>{t('addressTitle')}</CardTitle>
              <CardDescription>{t('addressDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-sm flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{tAuth('streetAddress')}</span>
                    <p className="text-foreground font-medium mt-0.5">{initialProfile.streetAddress || <span className="text-muted-foreground italic">{t('notProvided')}</span>}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4" />
                  <div>
                    <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{tAuth('city')}</span>
                    <p className="text-foreground font-medium mt-0.5">{initialProfile.city || <span className="text-muted-foreground italic">{t('notProvided')}</span>}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4" />
                  <div>
                    <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">{tAuth('country')}</span>
                    <p className="text-foreground font-medium mt-0.5">{initialProfile.country || <span className="text-muted-foreground italic">{t('notProvided')}</span>}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      <Link
        href="/"
        className={`${buttonVariants({ variant: "outline" })} border-gray-300`}
      >
        {tReviews('backToShop')}
      </Link>
    </main>
  );
}