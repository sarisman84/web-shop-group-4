'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+46'); // Default to Sweden (+46)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Sweden');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

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

    if (error) {
      setError(error.message);
    } else {
      router.push('/auth/login?registered=true');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Create an Account</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
        </div>

        {/* Country Code & Phone Number */}
        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <div className="flex gap-2">
            <select 
              value={countryCode} 
              onChange={(e) => setCountryCode(e.target.value)} 
              className="p-2 border rounded bg-white text-sm"
            >
              <option value="+46">Sweden (+46)</option>
              <option value="+47">Norway (+47)</option>
              <option value="+45">Denmark (+45)</option>
              <option value="+358">Finland (+358)</option>
              <option value="+44">UK (+44)</option>
              <option value="+1">USA/Canada (+1)</option>
              <option value="+92">Pakistan (+92)</option>
              <option value="+91">India (+91)</option>
            </select>
            <input 
              type="tel" 
              placeholder="701234567" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              required 
              className="w-full p-2 border rounded" 
            />
          </div>
        </div>

        {/* Complete Address (Street, City, Country) */}
        <div>
          <label className="block text-sm font-medium">Street Address</label>
          <input type="text" placeholder="Street name, apartment, etc." value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required className="w-full p-2 border rounded" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium">City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Country</label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Passwords */}
        <div>
          <label className="block text-sm font-medium">Password (min 8 chars)</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-2 border rounded" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
}