-- 43-column / 10-locale printable metadata.
-- Additive only: no DROP, all new columns nullable for existing rows.

alter table public.printables
  add column if not exists theme_ko text,
  add column if not exists title_zh text,
  add column if not exists title_pt text,
  add column if not exists title_it text,
  add column if not exists title_vi text,
  add column if not exists parent_guide_zh text,
  add column if not exists parent_guide_pt text,
  add column if not exists parent_guide_it text,
  add column if not exists parent_guide_vi text,
  add column if not exists description_zh text,
  add column if not exists description_pt text,
  add column if not exists description_it text,
  add column if not exists description_vi text;

comment on column public.printables.theme_ko is 'Theme label for Korean display and related-item grouping';
comment on column public.printables.title_zh is 'Traditional Chinese title (zh-TW)';
comment on column public.printables.parent_guide_zh is 'Traditional Chinese imagination / parent guide copy';
comment on column public.printables.description_zh is 'Traditional Chinese intro note';
