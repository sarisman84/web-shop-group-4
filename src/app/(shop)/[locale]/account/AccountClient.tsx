'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { UserProfile } from '@/lib/data/userdata';
import { COUNTRY_CODES } from '@/lib/country-codes';
import {
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Package
} from 'lucide-react';

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
    <main id="main-content" className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-in fade-in-50 duration-300">

      {/* Hero / Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <div aria-hidden="true" className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border border-primary/20 shadow-inner shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t('title')}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> {t('verified')}
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">{t('subtitle')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/account/addresses" className={`${buttonVariants({ variant: "outline" })} gap-2 border-gray-300 bg-gray-200 hover:bg-gray-100 text-gray-900`}>
            <Package className="w-4 h-4" aria-hidden="true" /> {t('addresses')}
          </Link>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="gap-2 bg-gray-900 hover:bg-gray-700 text-white border-0 shadow-sm"
            >
              <Edit3 className="w-4 h-4" aria-hidden="true" /> {t('edit')}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-3 bg-destructive/15 text-destructive text-sm p-4 rounded-xl font-medium border border-destructive/20 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div role="status" className="flex items-center gap-3 bg-emerald-500/15 text-emerald-700 text-sm p-4 rounded-xl font-medium border border-emerald-500/20 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {isEditing ? (
        /* EDIT MODE */
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_1fr] gap-6 items-stretch">
            <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col gap-0 py-0 md:row-span-2 md:grid md:grid-rows-subgrid">
              <CardHeader className="py-4 px-4 bg-gray-100 dark:bg-gray-800/50 border-b">
                <CardTitle role="heading" aria-level={2} className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" aria-hidden="true" /> {t('editPersonalTitle')}
                </CardTitle>
                <CardDescription>{t('editPersonalDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 py-4 flex-1 flex flex-col justify-between">
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
                        className="flex h-9 w-28 items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {COUNTRY_CODES.map(({ code, key }) => (
                          <option key={code} value={code}>{tAuth(`countries.${key}`)} ({code})</option>
                        ))}
                        {/* A saved code that is not in the list must still be shown. */}
                        {!COUNTRY_CODES.some(({ code }) => code === countryCode) && (
                          <option value={countryCode}>{countryCode}</option>
                        )}
                      </select>
                      <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="bg-background" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col gap-0 py-0 md:row-span-2 md:grid md:grid-rows-subgrid">
              <CardHeader className="py-4 px-4 bg-gray-100 dark:bg-gray-800/50 border-b">
                <CardTitle role="heading" aria-level={2} className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" aria-hidden="true" /> {t('editAddressTitle')}
                </CardTitle>
                <CardDescription>{t('editAddressDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 py-4 flex-1 flex flex-col justify-between">
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

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { resetForm(); setIsEditing(false); }}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[130px]">
              {loading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      ) : (
        /* VIEW MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_1fr] gap-6 items-stretch">
          <Card className="border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col gap-0 py-0 md:row-span-2 md:grid md:grid-rows-subgrid">
            <CardHeader className="py-4 px-4 bg-gray-100 dark:bg-gray-800/50 border-b">
              <CardTitle role="heading" aria-level={2} className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" aria-hidden="true" /> {t('personalTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-4 text-sm flex-1 flex flex-col justify-between">
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

          <Card className="border-border/60 shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col gap-0 py-0 md:row-span-2 md:grid md:grid-rows-subgrid">
            <CardHeader className="py-4 px-4 bg-gray-100 dark:bg-gray-800/50 border-b">
              <CardTitle role="heading" aria-level={2} className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" aria-hidden="true" /> {t('addressTitle')}
              </CardTitle>
              <CardDescription>{t('addressDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-4 text-sm flex-1 flex flex-col justify-between">
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

      <div className="pt-4">
        <Link
          href="/"
          className={`${buttonVariants({ variant: "outline" })} bg-gray-900 hover:bg-gray-500 text-white border-0 gap-2 shadow-sm`}
        >
          {tReviews('backToShop')}
        </Link>
      </div>
    </main>
  );
}