/**
 * Phone country codes offered when registering and when editing the profile.
 * `key` is the entry under `auth.countries` in the message files. One list for
 * both forms, so they cannot drift apart.
 */
export const COUNTRY_CODES = [
  { code: "+46", key: "se" },
  { code: "+47", key: "no" },
  { code: "+45", key: "dk" },
  { code: "+358", key: "fi" },
  { code: "+44", key: "gb" },
  { code: "+1", key: "us" },
  { code: "+92", key: "pk" },
  { code: "+91", key: "in" },
] as const;
