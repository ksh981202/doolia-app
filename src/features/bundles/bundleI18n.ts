export const BUNDLE_BADGE_I18N: Record<string, (count: number) => string> = {
  ko: (count) => `📄 ${count}장 테마 모음집`,
  en: (count) => `📄 ${count}-Sheet Theme Pack`,
  ja: (count) => `📄 ${count}枚 テーマコレクション`,
  zh: (count) => `📄 ${count}張 主題精選輯`,
  es: (count) => `📄 Colección Temática de ${count} Páginas`,
  pt: (count) => `📄 Coleção Temática de ${count} Desenhos`,
  de: (count) => `📄 ${count}-Seiten Themenpaket`,
  fr: (count) => `📄 Collection Thématique ${count} Pages`,
  it: (count) => `📄 Collezione a Tema ${count} Pagine`,
  vi: (count) => `📄 Tuyển Tập ${count} Tranh Theo Chủ Đề`,
};

export const TOGGLE_I18N: Record<string, { bw: string; color: string; bwPdf: string; colorPdf: string }> = {
  ko: { bw: '🖨️ 흑백 도안', color: '🎨 컬러 완성본', bwPdf: '🖨️ 흑백 도안 PDF', colorPdf: '🎨 컬러 완성본 PDF' },
  en: { bw: '🖨️ B&W', color: '🎨 Color', bwPdf: '🖨️ Download B&W PDF', colorPdf: '🎨 Download Color PDF' },
  ja: { bw: '🖨️ 白黒', color: '🎨 カラー', bwPdf: '🖨️ 白黒ぬりえ PDF', colorPdf: '🎨 カラー見本 PDF' },
  zh: { bw: '🖨️ 黑白線稿', color: '🎨 彩色範本', bwPdf: '🖨️ 下載黑白 PDF', colorPdf: '🎨 下載彩色 PDF' },
  es: { bw: '🖨️ B/N', color: '🎨 Color', bwPdf: '🖨️ PDF Blanco y Negro', colorPdf: '🎨 PDF a Color' },
  pt: { bw: '🖨️ P&B', color: '🎨 Colorido', bwPdf: '🖨️ PDF Preto e Branco', colorPdf: '🎨 PDF Colorido' },
  de: { bw: '🖨️ S/W', color: '🎨 Farbe', bwPdf: '🖨️ Schwarz-Weiß PDF', colorPdf: '🎨 Farb-Vorlage PDF' },
  fr: { bw: '🖨️ N&B', color: '🎨 Couleur', bwPdf: '🖨️ PDF Noir et Blanc', colorPdf: '🎨 PDF en Couleur' },
  it: { bw: '🖨️ B/N', color: '🎨 A Colori', bwPdf: '🖨️ PDF Bianco e Nero', colorPdf: '🎨 PDF a Colori' },
  vi: { bw: '🖨️ Trắng Đen', color: '🎨 Mẫu Màu', bwPdf: '🖨️ Tải PDF Trắng Đen', colorPdf: '🎨 Tải PDF Màu' },
};

export const GALLERY_I18N: Record<
  string,
  {
    countText: (total: number, start: number, end: number) => string;
    prev: string;
    next: string;
    pageText: (cur: number, total: number) => string;
  }
> = {
  ko: { countText: (t, s, e) => `총 ${t}개 도안 중 (${s}~${e}번)`, prev: '‹ 이전', next: '다음 ›', pageText: (c, t) => `${c}/${t} 페이지` },
  en: { countText: (t, s, e) => `Showing ${s}-${e} of ${t} pages`, prev: '‹ Prev', next: 'Next ›', pageText: (c, t) => `Page ${c}/${t}` },
  ja: { countText: (t, s, e) => `全${t}枚中 (${s}〜${e}枚目)`, prev: '‹ 前へ', next: '次へ ›', pageText: (c, t) => `${c}/${t} ページ` },
  zh: { countText: (t, s, e) => `共 ${t} 張著色畫（第 ${s}~${e} 張）`, prev: '‹ 上一頁', next: '下一頁 ›', pageText: (c, t) => `第 ${c}/${t} 頁` },
  es: { countText: (t, s, e) => `Mostrando ${s}-${e} de ${t} dibujos`, prev: '‹ Ant', next: 'Sig ›', pageText: (c, t) => `Pág ${c}/${t}` },
  pt: { countText: (t, s, e) => `Mostrando ${s}-${e} de ${t} desenhos`, prev: '‹ Ant', next: 'Próx ›', pageText: (c, t) => `Pág ${c}/${t}` },
  de: { countText: (t, s, e) => `Zeige ${s}-${e} von ${t} Vorlagen`, prev: '‹ Zurück', next: 'Weiter ›', pageText: (c, t) => `Seite ${c}/${t}` },
  fr: { countText: (t, s, e) => `${s}-${e} sur ${t} coloriages`, prev: '‹ Préc', next: 'Suiv ›', pageText: (c, t) => `Page ${c}/${t}` },
  it: { countText: (t, s, e) => `Mostrando ${s}-${e} di ${t} disegni`, prev: '‹ Prec', next: 'Succ ›', pageText: (c, t) => `Pag ${c}/${t}` },
  vi: { countText: (t, s, e) => `Hiển thị ${s}-${e} trên ${t} tranh`, prev: '‹ Trước', next: 'Sau ›', pageText: (c, t) => `Trang ${c}/${t}` },
};

export const LOADING_PDF_I18N: Record<string, string> = {
  ko: '⏳ PDF 생성 중...',
  en: '⏳ Generating PDF...',
  ja: '⏳ PDF作成中...',
  zh: '⏳ 正在生成 PDF...',
  es: '⏳ Generando PDF...',
  pt: '⏳ Gerando PDF...',
  de: '⏳ PDF wird erstellt...',
  fr: '⏳ Création du PDF...',
  it: '⏳ Generazione PDF...',
  vi: '⏳ Đang tạo PDF...',
};

export const AFFILIATE_DISCLOSURE_I18N: Record<string, string> = {
  ko: '제휴 활동의 일환으로 일정 수수료를 지급받을 수 있습니다.',
  en: 'As part of affiliate activities, we may earn a small commission.',
  ja: 'アフィリエイト活動の一環として、一定の手数料を受け取る場合があります。',
  zh: '本站透過聯盟行銷推廣活動，可能會賺取微薄的推薦佣金。',
  es: 'Podemos recibir una pequeña comisión como parte de actividades de afiliados.',
  pt: 'Podemos receber uma pequena comissão por meio de links de afiliados.',
  de: 'Im Rahmen von Partnerprogrammen können wir eine kleine Provision erhalten.',
  fr: "Dans le cadre de liens d'affiliation, nous pouvons recevoir une commission.",
  it: 'Nell\'ambito di attività di affiliazione, potremmo ricevere una commissione.',
  vi: 'Chúng tôi có thể nhận được một khoản hoa hồng nhỏ từ liên kết tiếp thị.',
};

export const BACK_TO_BUNDLES_I18N: Record<string, string> = {
  ko: '‹ 모든 모음집 목록으로 돌아가기',
  en: '‹ Back to All Collections',
  ja: '‹ すべてのコレクション一覧に戻る',
  zh: '‹ 返回所有主題精選集列表',
  es: '‹ Volver a Todas las Colecciones',
  pt: '‹ Voltar para Todas as Coleções',
  de: '‹ Zurück zu Allen Paketen',
  fr: '‹ Retour à Toutes les Collections',
  it: '‹ Torna a Tutte le Raccolte',
  vi: '‹ Quay lại Tất Cả Tuyển Tập',
};
