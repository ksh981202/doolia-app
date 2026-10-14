import { useState, useEffect, useRef, type MouseEvent } from 'react'
import { X, Trash2, Printer, Download, Sparkles, Loader2, ExternalLink, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePrintableCollection, type CollectionItem } from './usePrintableCollection'
import {
  AFFILIATE_GUIDE_TITLE,
  type AffiliateItem,
  getAffiliateLink,
  getNextAffiliateItem,
  pickAffiliateText,
  resolveAffiliateVideoUrl,
} from '@/shared/config/affiliates'
import { incrementAffiliateClick, incrementAffiliateImpression } from '@/services/affiliateService'

function AffiliateMedia({ affiliate, alt }: { affiliate: AffiliateItem; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoSrc = resolveAffiliateVideoUrl(affiliate)
  const [showVideo, setShowVideo] = useState(Boolean(videoSrc))

  useEffect(() => {
    setShowVideo(Boolean(videoSrc))
  }, [videoSrc])

  useEffect(() => {
    const node = videoRef.current
    if (!node || !showVideo) return
    node.muted = true
    node.defaultMuted = true
    node.playsInline = true
    const play = () => {
      void node.play().catch(() => undefined)
    }
    play()
    node.addEventListener('canplay', play)
    node.addEventListener('loadeddata', play)
    return () => {
      node.removeEventListener('canplay', play)
      node.removeEventListener('loadeddata', play)
      node.pause()
    }
  }, [videoSrc, showVideo])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 shadow-sm mb-3">
      {showVideo && videoSrc ? (
        <video
          key={videoSrc}
          ref={videoRef}
          src={videoSrc}
          poster={affiliate.image}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          className="h-full w-full object-cover"
          onError={() => setShowVideo(false)}
        />
      ) : (
        <img src={affiliate.image} alt={alt} className="h-full w-full object-cover" />
      )}
    </div>
  )
}

interface CollectionModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CollectionTexts {
  modalAria: string
  closeAria: string
  title: (count: number) => string
  subtitle: string
  emptyTitle: string
  emptyDesc: string
  deleteTooltip: string
  deleteItemAria: (title: string) => string
  btnPrint: (count: number) => string
  btnPdf: string
  pdfGenerating: string
  clearAll: string
}

const COLLECTION_DICTIONARY: Record<string, CollectionTexts> = {
  ko: {
    modalAria: '담은 색칠도안 검토',
    closeAria: '닫기',
    title: (count) => `내가 담은 색칠도안 (${count}/9장)`,
    subtitle: '한 번에 묶어서 인쇄하거나 모아진 PDF로 간편하게 저장하세요.',
    emptyTitle: '담은 도안이 없습니다',
    emptyDesc: '마음에 드는 도안의 + 버튼을 눌러 모아보세요.',
    deleteTooltip: '도안 바구니에서 삭제',
    deleteItemAria: (title) => `${title} 삭제`,
    btnPrint: (count) => `${count}장 한 번에 인쇄`,
    btnPdf: '묶음 PDF 다운로드',
    pdfGenerating: 'PDF 생성 중...',
    clearAll: '전체 비우기',
  },
  en: {
    modalAria: 'Review coloring basket',
    closeAria: 'Close',
    title: (count) => `Coloring Basket (${count}/9)`,
    subtitle: 'Print all at once or download as a bundled PDF.',
    emptyTitle: 'No printables added yet',
    emptyDesc: 'Click the + button on coloring pages to collect them.',
    deleteTooltip: 'Remove from basket',
    deleteItemAria: (title) => `Remove ${title}`,
    btnPrint: (count) => `Print All (${count})`,
    btnPdf: 'Download Bundle PDF',
    pdfGenerating: 'Generating PDF...',
    clearAll: 'Clear All',
  },
  zh: {
    modalAria: '查看已收藏著色圖',
    closeAria: '關閉',
    title: (count) => `已收藏著色圖 (${count}/9張)`,
    subtitle: '一次批量列印或合併儲存為高畫質 PDF。',
    emptyTitle: '目前尚未加入任何著色圖',
    emptyDesc: '點擊喜歡的著色圖上的 + 按鈕即可加入。',
    deleteTooltip: '從籃子中刪除',
    deleteItemAria: (title) => `刪除 ${title}`,
    btnPrint: (count) => `批量列印 ${count} 張`,
    btnPdf: '下載合併 PDF',
    pdfGenerating: '正在生成 PDF...',
    clearAll: '全部清除',
  },
  ja: {
    modalAria: '保存したぬりえを確認',
    closeAria: '閉じる',
    title: (count) => `保存したぬりえ (${count}/9枚)`,
    subtitle: 'まとめて一度に印刷するか、PDFとして保存できます。',
    emptyTitle: '保存されたぬりえがありません',
    emptyDesc: 'お気に入りのぬりえの「+」を押して集めてみましょう。',
    deleteTooltip: 'バスケットから削除',
    deleteItemAria: (title) => `${title}を削除`,
    btnPrint: (count) => `${count}枚を一括印刷`,
    btnPdf: 'まとめPDF保存',
    pdfGenerating: 'PDF生成中...',
    clearAll: 'すべて削除',
  },
  es: {
    modalAria: 'Revisar dibujos seleccionados',
    closeAria: 'Cerrar',
    title: (count) => `Mis dibujos para colorear (${count}/9)`,
    subtitle: 'Imprime todos a la vez o guárdalos como un PDF combinado.',
    emptyTitle: 'Aún no hay dibujos guardados',
    emptyDesc: 'Haz clic en el botón + de tus dibujos favoritos para guardarlos.',
    deleteTooltip: 'Eliminar de la cesta',
    deleteItemAria: (title) => `Eliminar ${title}`,
    btnPrint: (count) => `Imprimir todo (${count})`,
    btnPdf: 'Descargar PDF combinado',
    pdfGenerating: 'Generando PDF...',
    clearAll: 'Vaciar todo',
  },
  de: {
    modalAria: 'Ausgewählte Ausmalbilder ansehen',
    closeAria: 'Schließen',
    title: (count) => `Meine Ausmalbilder (${count}/9)`,
    subtitle: 'Drucken Sie alle auf einmal oder laden Sie sie als gebündeltes PDF herunter.',
    emptyTitle: 'Noch keine Ausmalbilder hinzugefügt',
    emptyDesc: 'Klicken Sie bei Ihren Lieblingsbildern auf +, um sie zu sammeln.',
    deleteTooltip: 'Aus dem Korb entfernen',
    deleteItemAria: (title) => `${title} entfernen`,
    btnPrint: (count) => `Alle drucken (${count})`,
    btnPdf: 'Gebündeltes PDF herunterladen',
    pdfGenerating: 'PDF wird erstellt...',
    clearAll: 'Alles leeren',
  },
  fr: {
    modalAria: 'Voir mon panier de coloriages',
    closeAria: 'Fermer',
    title: (count) => `Mon panier de coloriages (${count}/9)`,
    subtitle: 'Imprimez tout d’un coup ou téléchargez un PDF groupé.',
    emptyTitle: 'Aucun coloriage ajouté',
    emptyDesc: 'Cliquez sur le bouton + sur vos coloriages préférés pour les ajouter.',
    deleteTooltip: 'Supprimer du panier',
    deleteItemAria: (title) => `Supprimer ${title}`,
    btnPrint: (count) => `Tout imprimer (${count})`,
    btnPdf: 'Télécharger le PDF groupé',
    pdfGenerating: 'Génération du PDF...',
    clearAll: 'Tout vider',
  },
  pt: {
    modalAria: 'Ver desenhos selecionados',
    closeAria: 'Fechar',
    title: (count) => `Meus desenhos para colorir (${count}/9)`,
    subtitle: 'Imprima todos de uma vez ou baixe como um PDF combinado.',
    emptyTitle: 'Nenhum desenho adicionado ainda',
    emptyDesc: 'Clique no botão + nos desenhos favoritos para juntá-los.',
    deleteTooltip: 'Remover da cesta',
    deleteItemAria: (title) => `Remover ${title}`,
    btnPrint: (count) => `Imprimir todos (${count})`,
    btnPdf: 'Baixar PDF combinado',
    pdfGenerating: 'Gerando PDF...',
    clearAll: 'Limpar tudo',
  },
  it: {
    modalAria: 'Rivedi i disegni selezionati',
    closeAria: 'Chiudi',
    title: (count) => `I miei disegni da colorare (${count}/9)`,
    subtitle: 'Stampa tutti insieme o scarica come un PDF combinato.',
    emptyTitle: 'Nessun disegno aggiunto',
    emptyDesc: 'Fai clic sul pulsante + sui disegni che preferisci per raccoglierli.',
    deleteTooltip: 'Rimuovi dal cestino',
    deleteItemAria: (title) => `Rimuovi ${title}`,
    btnPrint: (count) => `Stampa tutti (${count})`,
    btnPdf: 'Scarica PDF combinato',
    pdfGenerating: 'Generazione PDF...',
    clearAll: 'Svuota tutto',
  },
  vi: {
    modalAria: 'Xem tranh tô màu đã chọn',
    closeAria: 'Đóng',
    title: (count) => `Tranh tô màu đã chọn (${count}/9)`,
    subtitle: 'In tất cả cùng lúc hoặc tải về dưới dạng tệp PDF gộp tiện lợi.',
    emptyTitle: 'Chưa có tranh tô màu nào',
    emptyDesc: 'Nhấn nút + trên các bức tranh bạn thích để thu thập nhé.',
    deleteTooltip: 'Xóa khỏi giỏ',
    deleteItemAria: (title) => `Xóa ${title}`,
    btnPrint: (count) => `In tất cả (${count} tranh)`,
    btnPdf: 'Tải PDF tổng hợp',
    pdfGenerating: 'Đang tạo PDF...',
    clearAll: 'Xóa tất cả',
  },
}

export function CollectionModal({ isOpen, onClose }: CollectionModalProps) {
  const { t, i18n } = useTranslation()
  const { items, removeFromCollection, clearCollection } = usePrintableCollection()
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const [affiliateItem, setAffiliateItem] = useState<AffiliateItem>(getNextAffiliateItem);

  useEffect(() => {
    if (isOpen) {
      setAffiliateItem(getNextAffiliateItem());
    }
  }, [isOpen]);
  const lang = (i18n.language || 'ko').slice(0, 2)
  const dict = COLLECTION_DICTIONARY[lang] || COLLECTION_DICTIONARY.ko
  const affiliateLink = getAffiliateLink(affiliateItem, lang)
  const affiliateKey = affiliateItem.id.startsWith('affiliate_') ? affiliateItem.id : `affiliate_${affiliateItem.id}`
  const affiliateHeadline = t(`affiliate.${affiliateKey}.title`, {
    defaultValue: pickAffiliateText(affiliateItem.headline, lang),
  })
  const affiliatePain = t(`affiliate.${affiliateKey}.pain_point`, {
    defaultValue: pickAffiliateText(affiliateItem.painPoint, lang),
  })
  const affiliateBenefit1 = t(`affiliate.${affiliateKey}.point1`, {
    defaultValue: pickAffiliateText(affiliateItem.benefit1, lang),
  })
  const affiliateBenefit2 = t(`affiliate.${affiliateKey}.point2`, {
    defaultValue: pickAffiliateText(affiliateItem.benefit2, lang),
  })
  const affiliateCta = t(`affiliate.${affiliateKey}.cta_btn`, {
    defaultValue: pickAffiliateText(affiliateItem.ctaText, lang),
  })

  useEffect(() => {
    if (!isOpen || items.length === 0) return
    void incrementAffiliateImpression(affiliateItem.id)
  }, [isOpen, items.length, affiliateItem.id])

  const handleAffiliateClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    void incrementAffiliateClick(affiliateItem.id)
    window.open(affiliateLink, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handlePrintAll = () => {
    if (items.length === 0) return
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 150)
  }

  const handleDownloadPdfBundle = async () => {
    if (items.length === 0 || isPdfGenerating) return;
    setIsPdfGenerating(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // 1. 구 R2 도메인을 CORS가 완벽히 열린 공식 cdn.doolia.app으로 강제 정규화
        let cleanUrl = item.image_bw_url;
        if (cleanUrl.includes('pub-1c8b49597bc74e7b9406c9d7110f708d.r2.dev')) {
          cleanUrl = cleanUrl.replace('https://pub-1c8b49597bc74e7b9406c9d7110f708d.r2.dev', 'https://cdn.doolia.app');
        }

        // 2. 브라우저 캐시 오염을 우회하여 항상 순수 CORS 응답을 보장하도록 요청
        const response = await fetch(cleanUrl, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache',
        });
        if (!response.ok) throw new Error(`이미지 로드 실패 (${response.status}): ${cleanUrl}`);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = objectUrl;
          });

          // 2. A4 캔버스 생성 및 고화질 렌더링
          const canvas = document.createElement('canvas');
          canvas.width = 1240;
          canvas.height = 1754;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context 생성 실패');

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 이미지 비율 유지 맞춤
          const margin = 60;
          const maxWidth = canvas.width - margin * 2;
          const maxHeight = canvas.height - margin * 2 - 80;
          const scale = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
          const drawWidth = img.naturalWidth * scale;
          const drawHeight = img.naturalHeight * scale;
          const drawX = (canvas.width - drawWidth) / 2;
          const drawY = margin + (maxHeight - drawHeight) / 2;

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

          // 하단 브랜드 푸터 텍스트
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DOOLIA | doolia.app', canvas.width / 2, canvas.height - 40);

          const pageDataUrl = canvas.toDataURL('image/jpeg', 0.92);

          // 3. PDF 페이지 추가
          if (i > 0) doc.addPage('a4', 'portrait');
          doc.addImage(pageDataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      }

      doc.save('doolia-coloring-collection.pdf');
    } catch (error) {
      console.error('[CollectionModal PDF Error]', error);
      alert(t('collection.pdfError', 'PDF 생성 중 문제가 발생했습니다. 다시 시도해 주세요.'));
    } finally {
      setIsPdfGenerating(false);
    }
  };
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 print:hidden">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={dict.modalAria}
          className="relative z-10 max-w-4xl lg:max-w-5xl w-full max-h-[90vh] overflow-hidden rounded-3xl p-6 bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95 flex flex-col"
        >
          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:bg-slate-200 transition-colors"
            aria-label={dict.closeAria}
          >
            <X className="h-5 w-5" />
          </button>

          {/* 데스크톱 기준 좌우 2컬럼 분할 구조 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1">
            {/* A. 왼쪽 영역 */}
            <div className="lg:col-span-7 flex flex-col">
              {/* 헤더 */}
              <div className="mb-4 pr-8">
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  {dict.title(items.length)}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {dict.subtitle}
                </p>
              </div>

              {/* 도안 그리드 또는 빈 상태 */}
              {items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <div className="mb-3 rounded-full bg-emerald-50 p-3 text-emerald-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">{dict.emptyTitle}</h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-xs">
                    {dict.emptyDesc}
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[50vh] pr-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {items.map((item: CollectionItem) => (
                    <div
                      key={item.slug}
                      className="bg-white border border-slate-100 rounded-xl p-2 shadow-xs hover:shadow-sm transition-shadow relative group flex flex-col"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        <img
                          src={item.image_bw_url}
                          alt={item.title}
                          className="aspect-[3/4] object-contain w-full rounded-xl border border-slate-100 bg-slate-50 p-1"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => removeFromCollection(item.slug)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-full shadow-xs flex items-center justify-center transition-colors"
                          title={dict.deleteTooltip}
                          aria-label={dict.deleteItemAria(item.title)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="mt-1.5 line-clamp-1 text-center text-xs font-medium text-slate-700 px-0.5">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {/* 하단 액션 버튼 */}
              {items.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    {/* [🖨️ {count}장 한 번에 인쇄] (초록색 큼직한 버튼) */}
                    <button
                      type="button"
                      onClick={handlePrintAll}
                      disabled={isPrinting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                    >
                      <Printer className="h-4 w-4 shrink-0" />
                      <span>🖨️ {dict.btnPrint(items.length)}</span>
                    </button>

                    {/* [📥 묶음 PDF 다운로드] (보조 버튼) */}
                    <button
                      type="button"
                      onClick={handleDownloadPdfBundle}
                      disabled={isPdfGenerating}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-200 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                    >
                      {isPdfGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                          <span>{dict.pdfGenerating}</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 shrink-0 text-slate-600" />
                          <span>📥 {dict.btnPdf}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* [전체 비우기] 링크 */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={clearCollection}
                      className="text-xs text-slate-400 underline underline-offset-4 hover:text-red-500 transition-colors py-1 cursor-pointer"
                    >
                      {dict.clearAll}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* B. 오른쪽 영역: 제휴 추천 레이아웃 (DownloadModal과 100% 동일한 구조) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
              <div>
                {/* 상단 배지 */}
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1 text-[13px] font-bold tracking-tight text-emerald-900">
                    {t('affiliate.badge', { defaultValue: pickAffiliateText(affiliateItem.badge, lang) || '🎨 즐거운 미술놀이를 위한 준비물 추천' })}
                  </span>
                </div>

                {/* 메인 헤더: 상품 제목 */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-3">
                  {affiliateHeadline}
                </h3>

                {/* 미디어 (비디오 자동재생 또는 실사 이미지) */}
                <a
                  href={affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={handleAffiliateClick}
                  className="block group overflow-hidden rounded-2xl"
                >
                  <AffiliateMedia affiliate={affiliateItem} alt={affiliateHeadline} />
                </a>

                {/* 노란색 공감 박스 */}
                <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3 text-xs sm:text-sm font-semibold text-amber-950 leading-relaxed mb-3 flex items-start gap-2">
                  <span className="text-sm shrink-0">⚠️</span>
                  <p className="min-w-0 leading-relaxed font-semibold">{affiliatePain}</p>
                </div>

                {/* 체크포인트 리스트 (체크 아이콘과 함께 주요 특장점 2줄) */}
                <div className="space-y-2 rounded-xl border border-slate-100 bg-white/70 p-3.5 mb-3">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>{t('affiliate.guideTitle', { defaultValue: pickAffiliateText(AFFILIATE_GUIDE_TITLE, lang) || '이런 점을 확인해보세요' })}</span>
                  </p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500 font-bold" />
                      <span>{affiliateBenefit1}</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500 font-bold" />
                      <span>{affiliateBenefit2}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 풀와이드 강조 버튼 & 법적 공지 */}
              <div>
                <a
                  href={affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={handleAffiliateClick}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{affiliateCta}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-white" />
                </a>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  {t('detail.affiliateDisclaimer', '제휴 활동의 일환으로 일정 수수료를 지급받을 수 있습니다.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="doolia-collection-print-container" className="hidden print:block">
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body > *:not(#doolia-collection-print-container) {
              display: none !important;
            }
            .collection-print-page {
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              width: 100vw !important;
              height: 100vh !important;
              page-break-after: always !important;
              break-after: page !important;
              box-sizing: border-box !important;
            }
            .collection-print-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            .collection-print-art {
              flex: 1 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              min-height: 0 !important;
            }
            .collection-print-image {
              max-width: 100% !important;
              max-height: 94% !important;
              object-fit: contain !important;
            }
            .collection-print-footer {
              height: 24px !important;
              border-top: 1px solid #cbd5e1 !important;
              display: flex !important;
              align-items: center !important;
              font-size: 11px !important;
              color: #64748b !important;
              padding-top: 4px !important;
            }
          }
        `}</style>
        {items.map((item, index) => (
          <div key={`print-${item.slug}-${index}`} className="collection-print-page">
            <div className="collection-print-art">
              <img
                src={item.image_bw_url}
                alt={item.title}
                className="collection-print-image"
              />
            </div>
            <div className="collection-print-footer">
              <span>DOOLIA | doolia.app</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

