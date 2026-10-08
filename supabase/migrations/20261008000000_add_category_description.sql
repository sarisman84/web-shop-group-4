-- T100 (issue #149): category descriptions for the dynamic CategoryIntroduction.
--
-- Adds a nullable `description` column to `public.categories` so the catalogue
-- page can render a per-category subtitle next to the per-category title
-- (`name`) and background (`image`).
--
-- Nullable on purpose: existing rows are left untouched (they read back as
-- NULL, which the data layer maps to ""), and the page falls back to the
-- default subtitle whenever the description is NULL or empty.
--
-- Additive only: no existing column is altered, no row is updated, and the
-- existing public SELECT policies keep working unchanged (they already cover
-- the whole row, so the new column is readable through the Data API as soon
-- as PostgREST picks it up).

alter table public.categories
  add column if not exists description text;
