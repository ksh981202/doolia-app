-- Expand printables.category to 14 canonical catalog slugs
-- while still accepting the original 5 legacy values.

alter table public.printables
  drop constraint if exists printables_category_check;

alter table public.printables
  add constraint printables_category_check
  check (category in (
    -- legacy (existing rows / old uploaders)
    'coloring',
    'maze',
    'tracing',
    'alphabet',
    'numbers',
    -- canonical 14 catalog slugs
    'coloring-pages',
    'letters',
    'cutout',
    'ispy',
    'odd-one',
    'dots',
    'shadow',
    'routine',
    'emotion',
    'puppets',
    'board-game',
    'season'
  ));

comment on column public.printables.category is
  'Canonical catalog slug (coloring-pages|tracing|letters|cutout|ispy|odd-one|maze|dots|shadow|routine|emotion|puppets|board-game|season). Legacy coloring|alphabet|numbers still accepted.';
