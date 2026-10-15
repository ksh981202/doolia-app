import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug, lang = 'ko' } = req.query;
  const printableSlug = Array.isArray(slug) ? slug[0] : slug;
  const targetLang = Array.isArray(lang) ? lang[0] : lang;

  if (!printableSlug) {
    return res.redirect(302, '/');
  }

  try {
    const { data: item } = await supabase
      .from('printables')
      .select('*')
      .eq('slug', printableSlug)
      .maybeSingle();

    if (!item) {
      return res.redirect(302, `/printable/${printableSlug}`);
    }

    const title = item[`title_${targetLang}`] || item.title_ko || item.title || 'DOOLIA';
    const description = item[`description_${targetLang}`] || item.description_ko || item.description || title;
    const imageUrl = item.image_color_url || item.image_bw_url || 'https://www.doolia.app/og-image.png';

    const html = `<!DOCTYPE html>
<html lang="${targetLang}">
<head>
  <meta charset="utf-8" />
  <title>${title} | DOOLIA</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title} | DOOLIA" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="https://www.doolia.app/printable/${printableSlug}?lang=${targetLang}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title} | DOOLIA" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
</head>
<body>
  <script>window.location.replace('/printable/${printableSlug}?lang=${targetLang}');</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (error) {
    return res.redirect(302, `/printable/${printableSlug}`);
  }
}
