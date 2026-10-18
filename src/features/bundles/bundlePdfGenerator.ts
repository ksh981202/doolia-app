export interface GenerateBundlePdfOptions {
  bundle: any;
  mode: 'bw' | 'color';
  cdnBase?: string;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

export const generateBundlePdf = async ({
  bundle,
  mode,
  cdnBase,
  onSuccess,
  onError,
}: GenerateBundlePdfOptions) => {
  try {
    // 어드민 등록 고화질 URL이 있으면 우선 열기
    const directUrl = mode === 'bw'
      ? bundle.pdf_download_url
      : (bundle.pdf_color_url || bundle.pdf_download_url?.replace(/\.pdf$/i, '_c.pdf'));

    if (directUrl && directUrl !== '#' && directUrl.trim() !== '') {
      window.open(directUrl, '_blank');
      onSuccess?.();
      return;
    }

    // 다운로드 클릭 시점에만 jsPDF 동적 로딩 (첫 화면 400kB 로딩 낭비 차단)
    const { default: jsPDF } = await import('jspdf');
    const slugs: string[] = bundle?.item_slugs && bundle.item_slugs.length > 0 ? bundle.item_slugs : [];
    if (slugs.length === 0) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;

    for (let i = 0; i < slugs.length; i++) {
      const slugItem = slugs[i];
      const suffix = mode === 'bw' ? 'b' : 'c';
      const defaultCdn = import.meta.env.VITE_CDN_URL || 'https://cdn.doolia.app';
      const base = cdnBase || defaultCdn;
      const urls = [
        `${base}/printables/${slugItem}_${suffix}.webp`,
        `https://pub-1c8b49597bc74e7b9406c9d7110f708d.r2.dev/printables/${slugItem}_${suffix}.webp`
      ];

      let base64: string | null = null;
      for (const u of urls) {
        try {
          const res = await fetch(u);
          if (!res.ok) continue;
          const blob = await res.blob();
          base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          break;
        } catch (e) {}
      }

      if (base64) {
        if (doc.getNumberOfPages() > 0 && i > 0) doc.addPage();
        doc.addImage(base64, 'WEBP', 15, 15, pageWidth - 30, pageHeight - 30, undefined, 'FAST');
      }
    }

    const filename = `${bundle.title_ko || bundle.slug || 'doolia'}_${mode === 'bw' ? '흑백도안' : '컬러완성본'}.pdf`;
    doc.save(filename);
    onSuccess?.();
  } catch (err) {
    console.error('PDF 생성 실패', err);
    onError?.(err);
  }
};
