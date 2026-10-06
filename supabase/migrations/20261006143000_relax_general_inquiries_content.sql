alter table public.general_inquiries
  drop constraint if exists general_inquiries_content_check;

alter table public.general_inquiries
  add constraint general_inquiries_content_check
  check (char_length(btrim(content)) between 2 and 4000);
