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

    // ① QR 코드 이미지 사전 캐싱
    let qrBase64: string | null = null;
    try {
      const qrRes = await fetch('/qr-doolia.png');
      if (qrRes.ok) {
        const qrBlob = await qrRes.blob();
        qrBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(qrBlob);
        });
      }
    } catch (e) {
      // QR 로드 실패 시에도 PDF 생성이 중단되지 않도록 try-catch 안전 fallback 처리
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const promises = slugs.map(async (slugItem, index) => {
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

      return { index, base64 };
    });

    const results = await Promise.all(promises);
    results.sort((a, b) => a.index - b.index);

    // ③ 하단 푸터 밴드 렌더링 함수 정의
    const renderFooter = () => {
      // 구분선: Y=280mm 위치에 연한 회색 라인
      doc.setDrawColor(226, 232, 240);
      doc.line(10, 280, 200, 280);

      // 좌측 브랜딩 텍스트
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // #475569 (slate-600)
      doc.text('DOOLIA · 100% Free Kids Coloring Sheets', 10, 287);

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // #94a3b8
      doc.text('Print, Color & Imagine! www.doolia.app', 10, 291.5);

      // 우측 QR 코드
      if (qrBase64) {
        doc.addImage(qrBase64, 'PNG', 190.5, 282, 9.5, 9.5);
      }
    };

    let addedCount = 0;
    for (const item of results) {
      if (item.base64) {
        if (addedCount > 0) {
          doc.addPage();
        }
        // ② 페이지별 도안 배치 영역 조정: 190x255
        doc.addImage(item.base64, 'WEBP', 10, 10, 190, 255, undefined, 'FAST');
        // 각 페이지마다 푸터 렌더링
        renderFooter();
        addedCount++;
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


