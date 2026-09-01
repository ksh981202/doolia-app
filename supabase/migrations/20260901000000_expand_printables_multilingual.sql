-- Expand printables for 30-column TSV / 6-locale metadata.
-- Additive only: no DROP, all new columns nullable for existing rows.

alter table public.printables
  add column if not exists type text default 'bw',
  add column if not exists title_ja text,
  add column if not exists title_es text,
  add column if not exists title_de text,
  add column if not exists title_fr text,
  add column if not exists age_group text,
  add column if not exists age_group_en text,
  add column if not exists theme_en text,
  add column if not exists benefit_1 text,
  add column if not exists benefit_2 text,
  add column if not exists benefit_3 text,
  add column if not exists parent_guide_ko text,
  add column if not exists parent_guide_en text,
  add column if not exists parent_guide_ja text,
  add column if not exists parent_guide_es text,
  add column if not exists parent_guide_de text,
  add column if not exists parent_guide_fr text,
  add column if not exists description_ko text,
  add column if not exists description_en text,
  add column if not exists description_ja text,
  add column if not exists description_es text,
  add column if not exists description_de text,
  add column if not exists description_fr text;

comment on column public.printables.type is 'Asset set: bw | color | single';
comment on column public.printables.age_group is 'Display age group (localized / source language)';
comment on column public.printables.age_group_en is 'Age group key for filters (English/standard)';
comment on column public.printables.theme_en is 'Theme key for filters (English/standard)';

create index if not exists printables_type_idx
  on public.printables (type);

create index if not exists printables_age_group_en_idx
  on public.printables (age_group_en);

create index if not exists printables_theme_en_idx
  on public.printables (theme_en);
