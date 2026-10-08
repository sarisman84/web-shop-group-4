'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
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
      setSuccessMessage('Profilen har uppdaterats!');
      setIsEditing(false);
      router.refresh(); // Uppdaterar serverkomponentens data
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mitt konto</h1>
          <p className="text-muted-foreground mt-1">Hantera dina personliga uppgifter och adresser.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/account/addresses" className={buttonVariants({ variant: "outline" })}>
            Leveransadresser
          </Link>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Redigera uppgifter
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
                <CardTitle>Redigera personliga uppgifter</CardTitle>
                <CardDescription>Uppdatera ditt namn och kontaktinformation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Förnamn</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Efternamn</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-post (Kan ej ändras)</Label>
                  <Input id="email" value={initialProfile.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Telefonnummer</Label>
                  <div className="flex gap-2">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)} 
                      className="flex h-9 w-28 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="+46">Sverige (+46)</option>
                      <option value="+47">Norge (+47)</option>
                      <option value="+45">Danmark (+45)</option>
                      <option value="+358">Finland (+358)</option>
                      <option value="+44">Storbritannien (+44)</option>
                      <option value="+1">USA (+1)</option>
                    </select>
                    <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redigera adress</CardTitle>
                <CardDescription>Uppdatera din leveransadress.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Gatuadress</Label>
                  <Input id="streetAddress" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Stad</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Land</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sparar...' : 'Spara ändringar'}
            </Button>
          </div>
        </form>
      ) : (
        /* VY-LÄGE */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personliga uppgifter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Fullständigt namn</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.fullName || "Ej angivet"}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">E-postadress</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.email}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Telefonnummer</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.fullPhoneNumber || "Ej angivet"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adressuppgifter</CardTitle>
              <CardDescription>Din standardleveransadress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Gatuadress</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.streetAddress || "Ej angivet"}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Stad</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.city || "Ej angivet"}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Land</span>
                <p className="text-foreground font-medium mt-0.5">{initialProfile.country || "Ej angivet"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Link 
        href="/" 
        className={`${buttonVariants({ variant: "outline" })} bg-gray-100 hover:bg-gray-300 text-gray-900`}
      >
        ← Tillbaka till butiken
      </Link>
    </div>
  );
}