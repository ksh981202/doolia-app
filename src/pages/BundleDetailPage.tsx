import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { usePrintablesQuery } from '../features/gallery/model/usePrintablesQuery';
import { getBundles } from '../services/adminBundleService';
import type { AdminBundle } from '../services/adminBundleService';
import {
  AFFILIATE_ITEMS,
  AFFILIATE_GUIDE_TITLE,
  pickAffiliateText,
  getAffiliateLink,
  resolveAffiliateVideoUrl,
  type AffiliateItem,
} from '../shared/config/affiliates';
import { incrementAffiliateClick, incrementAffiliateImpression } from '../services/affiliateService';
import {
  BUNDLE_BADGE_I18N,
  TOGGLE_I18N,
  GALLERY_I18N,
  LOADING_PDF_I18N,
  AFFILIATE_DISCLOSURE_I18N,
  BACK_TO_BUNDLES_I18N,
} from '../features/bundles/bundleI18n';
import { generateBundlePdf } from '../features/bundles/bundlePdfGenerator';

const BUNDLE_UI_I18N = {
  packComplete: {
    ko: '10장 완결 모음집',
    en: '10 Sheets Complete Pack',
    ja: '10枚完成パック',
    zh: '10張完整套裝',
    es: 'Paquete completo de 10 láminas',
    pt: 'Pacote completo de 10 folhas',
    de: '10 Seiten Komplettpaket',
    fr: 'Pack complet 10 feuilles',
    it: 'Pacchetto completo 10 fogli',
    vi: 'Trọn bộ 10 tranh tô',
  },
  bwPdf: {
    ko: '🖨️ 흑백 도안 PDF',
    en: '🖨️ B&W Printable PDF',
    ja: '🖨️ 白黒のぬりえ PDF',
    zh: '🖨️ 黑白線稿 PDF',
    es: '🖨️ PDF Imprimible B/N',
    pt: '🖨️ PDF Imprimível P&B',
    de: '🖨️ S/W Malvorlagen PDF',
    fr: '🖨️ PDF Coloriage N&B',
    it: '🖨️ PDF da Colorare B/N',
    vi: '🖨️ Tranh Tô Trắng Đen PDF',
  },
  colorPdf: {
    ko: '🎨 컬러 완성본 PDF',
    en: '🎨 Color Guide PDF',
    ja: '🎨 カラー完成見本 PDF',
    zh: '🎨 彩色範本 PDF',
    es: '🎨 Guía a Color PDF',
    pt: '🎨 Guia Colorido PDF',
    de: '🎨 Farbvorlage PDF',
    fr: '🎨 Modèle Couleur PDF',
    it: '🎨 Guida a Colori PDF',
    vi: '🎨 Tranh Mẫu Màu PDF',
  },
  preview: {
    ko: '👀 수록 도안 미리보기',
    en: '👀 Preview Included Sheets',
    ja: '👀 収録ぬりえ一覧',
    zh: '👀 收錄線稿預覽',
    es: '👀 Vista previa de láminas',
    pt: '👀 Prévia das folhas incluídas',
    de: '👀 Vorschau der enthaltenen Malvorlagen',
    fr: '👀 Aperçu des coloriages inclus',
    it: '👀 Anteprima dei disegni inclusi',
    vi: '👀 Xem trước các tranh trong bộ',
  },
  recommend: {
    ko: '💡 이런 점이 참 좋아요!',
    en: '💡 Why Kids Love It',
    ja: '💡 おすすめポイント',
    zh: '💡 推薦理由',
    es: '💡 ¡Por qué les encantará!',
    pt: '💡 Por que as crianças adoram!',
    de: '💡 Warum Kinder es lieben!',
    fr: '💡 Pourquoi les enfants l\'adorent !',
    it: '💡 Perché i bambini lo adorano!',
    vi: '💡 Điểm nổi bật bé sẽ thích!',
  },
  play: {
    ko: '✂️ 이렇게 놀아주면 더 신나요!',
    en: '✂️ Fun Activity Tips',
    ja: '✂️ 楽しいあそび方',
    zh: '✂️ 趣味玩法指南',
    es: '✂️ ¡Consejos divertidos de actividades!',
    pt: '✂️ Dicas de brincadeiras divertidas!',
    de: '✂️ Tolle Spiel- und Basteltipps!',
    fr: '✂️ Idées d\'activités amusantes !',
    it: '✂️ Idee di gioco divertenti!',
    vi: '✂️ Gợi ý cách chơi thật vui!',
  },
  tabBw: {
    ko: '흑백 도안',
    en: 'B&W',
    ja: '白黒',
    zh: '黑白',
    es: 'B/N',
    pt: 'P&B',
    de: 'S/W',
    fr: 'N&B',
    it: 'B/N',
    vi: 'Trắng đen',
  },
  tabColor: {
    ko: '컬러 완성본',
    en: 'Color',
    ja: 'カラー',
    zh: '彩色',
    es: 'Color',
    pt: 'Colorido',
    de: 'Farbe',
    fr: 'Couleur',
    it: 'A colori',
    vi: 'Màu',
  },
} as const;

function AffiliateMedia({ affiliate, alt }: { affiliate: AffiliateItem; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = resolveAffiliateVideoUrl(affiliate);
  const [showVideo, setShowVideo] = useState(Boolean(videoSrc));

  useEffect(() => {
    setShowVideo(Boolean(videoSrc));
  }, [videoSrc]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !showVideo) return;
    node.muted = true;
    node.defaultMuted = true;
    node.playsInline = true;
    const play = () => {
      void node.play().catch(() => undefined);
    };
    play();
    node.addEventListener('canplay', play);
    node.addEventListener('loadeddata', play);
    return () => {
      node.removeEventListener('canplay', play)
      node.removeEventListener('loadeddata', play);
      node.pause();
    };
  }, [videoSrc, showVideo]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 shadow-sm">
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
  );
}

type BundleWithGuide = AdminBundle & {
  title?: string;
  pdf_color_url?: string;
  recommend_reason?: string;
  how_to_play?: string;
};

export default function BundleDetailPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'ko').slice(0, 2);
  const { data: printables } = usePrintablesQuery();
  const { slug } = useParams<{ slug: string }>();
  const [bundle, setBundle] = useState<BundleWithGuide | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [randomAffiliate, setRandomAffiliate] = useState<AffiliateItem | null>(null);
  const [viewMode, setViewMode] = useState<'bw' | 'color'>('color');
  const [generatingMode, setGeneratingMode] = useState<'bw' | 'color' | null>(null);

  const [slideIndex, setSlideIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const slugs: string[] = bundle?.item_slugs && bundle.item_slugs.length > 0
    ? bundle.item_slugs
    : [slug || ''];
  const totalSlides = slugs.length;

  const toggleUi = TOGGLE_I18N[lang] || TOGGLE_I18N.en || TOGGLE_I18N.ko;
  const affiliateDisclosure = AFFILIATE_DISCLOSURE_I18N[lang] || AFFILIATE_DISCLOSURE_I18N.en || AFFILIATE_DISCLOSURE_I18N.ko;
  const loadingPdfText = LOADING_PDF_I18N[lang] || LOADING_PDF_I18N.en || LOADING_PDF_I18N.ko;
  const galUi = GALLERY_I18N[lang] || GALLERY_I18N.en || GALLERY_I18N.ko;

  const prevSlide = () => setSlideIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  const nextSlide = () => setSlideIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) nextSlide();
    if (diff < -40) prevSlide();
    setTouchStartX(null);
  };

  const currentSlug = slugs[slideIndex] || '';
  const currentSlideImg = `${import.meta.env.VITE_CDN_URL || 'https://cdn.doolia.app'}/printables/${currentSlug}_${viewMode === 'bw' ? 'b' : 'c'}.webp`;
  const fallbackSlideImg = `https://pub-1c8b49597bc74e7b9406c9d7110f708d.r2.dev/printables/${currentSlug}_${viewMode === 'bw' ? 'b' : 'c'}.webp`;

  const getI18nText = (key: keyof typeof BUNDLE_UI_I18N, i18nKey: string) => {
    const dict = BUNDLE_UI_I18N[key] as Record<string, string>;
    const fallback = dict[lang] || dict.en || dict.ko;
    const translated = t(i18nKey, fallback);
    return translated && translated !== i18nKey ? translated : fallback;
  };

  useEffect(() => {
    const all = getBundles();
    const found = all.find((b) => b.slug === slug);
    if (found) setBundle(found);
  }, [slug]);

  useEffect(() => {
    if (!bundle) return;

    const title = (bundle as any)?.[`title_${lang}`] || bundle.title_ko || bundle.title || '도안 모음집';
    const desc = (bundle as any)?.[`recommend_${lang}`] || bundle.recommend_reason || '둘리아 무료 색칠도안 모음집';
    const firstSlug = bundle.item_slugs?.[0] || bundle.slug || '';
    const imgUrl = `${import.meta.env.VITE_CDN_URL || 'https://cdn.doolia.app'}/printables/${firstSlug}_c.webp`;

    // 브라우저 탭 타이틀
    document.title = `${title} | DOOLIA`;

    // SNS 오픈그래프 동적 태그 갱신 헬퍼
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('og:title', `${title} | DOOLIA`);
    setMeta('og:description', desc);
    setMeta('og:image', imgUrl);
  }, [bundle, lang]);

  useEffect(() => {
    if (AFFILIATE_ITEMS && AFFILIATE_ITEMS.length > 0) {
      const specific = bundle?.affiliate_id
        ? AFFILIATE_ITEMS.find((p) => p.id === bundle.affiliate_id)
        : null;
      if (specific) {
        setRandomAffiliate(specific);
      } else {
        const randomIndex = Math.floor(Math.random() * AFFILIATE_ITEMS.length);
        setRandomAffiliate(AFFILIATE_ITEMS[randomIndex]);
      }
    }
  }, [bundle]);

  const downloadBundlePdf = async (mode: 'bw' | 'color') => {
    if (generatingMode) return;
    if (!bundle) return;

    setGeneratingMode(mode);
    await generateBundlePdf({
      bundle,
      mode,
      onSuccess: () => {
        setTimeout(() => setGeneratingMode(null), 2000);
      },
      onError: () => {
        alert('PDF 생성 중 오류가 발생했습니다.');
        setGeneratingMode(null);
      },
    });
  };

  const matchedAffiliate = randomAffiliate;

  useEffect(() => {
    if (matchedAffiliate) {
      void incrementAffiliateImpression(matchedAffiliate.id);
    }
  }, [matchedAffiliate?.id]);

  if (!bundle) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <span className="text-5xl mb-4">📚</span>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">모음집을 찾을 수 없습니다</h1>
        <p className="text-slate-500 mb-6 text-sm">요청하신 모음집이 삭제되었거나 주소가 잘못되었습니다.</p>
        <Link to="/bundles" className="px-6 py-2.5 rounded-full bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition">
          ← 모음집 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const affiliateBadge = matchedAffiliate
    ? pickAffiliateText(matchedAffiliate.badge, lang) || '🎨 즐거운 미술놀이를 위한 준비물 추천'
    : '';
  const affiliateHeadline = matchedAffiliate
    ? pickAffiliateText(matchedAffiliate.headline, lang)
    : '';
  const affiliatePain = matchedAffiliate
    ? pickAffiliateText(matchedAffiliate.painPoint, lang)
    : '';
  const affiliateGuide = pickAffiliateText(AFFILIATE_GUIDE_TITLE, lang) || '이런 점을 확인해보세요';
  const affiliateBenefit1 = matchedAffiliate
    ? pickAffiliateText(matchedAffiliate.benefit1, lang)
    : '';
  const affiliateBenefit2 = matchedAffiliate
    ? pickAffiliateText(matchedAffiliate.benefit2, lang)
    : '';
  const affiliateCta = matchedAffiliate
    ? pickAffiliateText(matchedAffiliate.ctaText, lang) || `${affiliateHeadline} 둘러보기`
    : '';
  const affiliateLink = matchedAffiliate
    ? getAffiliateLink(matchedAffiliate, lang)
    : 'https://link.coupang.com';

  const itemsPerPage = 6;
  const totalItems = bundle.item_slugs?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSlugs = (bundle.item_slugs || []).slice(startIndex, startIndex + itemsPerPage);

  const count = bundle?.item_slugs?.length || 10;
  const backToBundlesText = BACK_TO_BUNDLES_I18N[lang] || BACK_TO_BUNDLES_I18N.en || BACK_TO_BUNDLES_I18N.ko;
  const badgeText = (BUNDLE_BADGE_I18N[lang] || BUNDLE_BADGE_I18N.en || BUNDLE_BADGE_I18N.ko)(count);

  return (
    <div className="min-h-screen bg-slate-100/60 py-8 px-4 sm:px-6">
      {/* 뒤로가기 링크 */}
      <div className="max-w-5xl mx-auto pb-4">
        <Link to="/bundles" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition">
          {backToBundlesText}
        </Link>
      </div>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* 1. 상단 2단 레이아웃 (우측: 기존 DownloadModal 우측 제휴 카드와 100% 동일한 UI 표준 적용) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* [좌측 카드: 모음집 정보 & 표지] */}
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="flex flex-col mb-4">
              {/* 1행: 좌측 배지 & 우측 흑백/컬러 토글 스위치 (같은 높이 양끝 정렬) */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                  {badgeText}
                </span>

                <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('bw')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'bw'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {toggleUi.bw}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('color')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'color'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {toggleUi.color}
                  </button>
                </div>
              </div>

              {/* 2행: 메인 제목 (가로 폭 100% 확보되어 줄바꿈 없이 한 줄로 시원하게 표시) */}
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                {(bundle as any)?.[`title_${lang}`] || bundle.title_ko || bundle.title}
              </h1>
            </div>

            {/* 표지 이미지 박스 -> 슬라이더 컨테이너 */}
            <div 
              className="relative aspect-square w-full rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden p-6 select-none group"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {totalSlides > 1 && (
                <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  {slideIndex + 1} / {totalSlides}
                </div>
              )}

              <img
                key={`${currentSlug}_${viewMode}`}
                src={currentSlideImg}
                onError={(e) => {
                  const t = e.currentTarget;
                  if (t.src !== fallbackSlideImg) t.src = fallbackSlideImg;
                }}
                alt={`도안 미리보기 ${slideIndex + 1}`}
                className="w-full h-full object-contain pointer-events-none transition-transform duration-200"
              />

              {totalSlides > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="이전 도안"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white transition-all text-lg font-bold cursor-pointer"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="다음 도안"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white transition-all text-lg font-bold cursor-pointer"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* 최하단 메인 액션 버튼 (흑백 / 컬러 2분할 버튼) */}
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {/* 흑백 도안 PDF 버튼 */}
              <button
                type="button"
                onClick={() => downloadBundlePdf('bw')}
                disabled={generatingMode !== null}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {generatingMode === 'bw' ? loadingPdfText : toggleUi.bwPdf}
              </button>

              {/* 컬러 완성본 PDF 버튼 */}
              <button
                type="button"
                onClick={() => downloadBundlePdf('color')}
                disabled={generatingMode !== null}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {generatingMode === 'color' ? loadingPdfText : toggleUi.colorPdf}
              </button>
            </div>
          </div>

          {/* [우측 카드: 실제 저장된 제휴 광고 카드] */}
          {matchedAffiliate && (
            <div className="flex flex-col h-full justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1 text-[13px] font-bold tracking-tight text-emerald-900 sm:text-[13.5px]">
                    {affiliateBadge}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight mb-3">
                  {affiliateHeadline}
                </h2>
              </div>

              {/* 실제 미디어 컴포넌트 연동 (비디오/GIF/WebP 자동재생) */}
              <a
                href={affiliateLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => {
                  void incrementAffiliateClick(matchedAffiliate.id);
                }}
                className="block"
              >
                <AffiliateMedia affiliate={matchedAffiliate} alt={affiliateHeadline} />
              </a>

              {/* 세부 정보 박스 (경고 + 체크리스트) */}
              <div className="space-y-2">
                {/* ⚠️ 경고 박스: 노란색 배경(bg-amber-50), 테두리(border-amber-200/60), 텍스트 크기 일치 */}
                {affiliatePain && (
                  <div className="flex items-center justify-center gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50 px-4 py-2.5">
                    <span className="flex-shrink-0 text-base">⚠️</span>
                    <p className="min-w-0 text-center text-[13.5px] font-semibold leading-normal tracking-tight text-amber-950 break-keep sm:text-[14px] sm:break-words">
                      {affiliatePain}
                    </p>
                  </div>
                )}

                {/* 💡 체크리스트 박스: 연회색 배경, 체크 아이콘(text-emerald-500 font-bold), 행간 일치 */}
                <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="mb-1 flex items-center gap-1.5 text-[12.5px] font-bold text-slate-700">
                    <span>💡</span>
                    <span className="min-w-0 break-keep sm:break-words">{affiliateGuide}</span>
                  </p>
                  <ul className="space-y-2">
                    {affiliateBenefit1 && (
                      <li className="flex items-start gap-2 text-[13px] font-medium leading-snug text-slate-700 sm:text-[13.5px]">
                        <span className="mt-0.5 flex-shrink-0 font-bold text-emerald-500">✓</span>
                        <span className="min-w-0 break-keep sm:break-words">{affiliateBenefit1}</span>
                      </li>
                    )}
                    {affiliateBenefit2 && (
                      <li className="flex items-start gap-2 text-[13px] font-medium leading-snug text-slate-700 sm:text-[13.5px]">
                        <span className="mt-0.5 flex-shrink-0 font-bold text-emerald-500">✓</span>
                        <span className="min-w-0 break-keep sm:break-words">{affiliateBenefit2}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* 최하단 제휴 구매 링크 버튼 */}
              <div>
                <a
                  href={affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => {
                    void incrementAffiliateClick(matchedAffiliate.id);
                  }}
                  className="flex w-full h-[52px] items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-[15px] sm:text-[16px] font-bold text-white shadow-md transition-all"
                >
                  <span>{affiliateCta}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-white" />
                </a>
                <p className="mt-1.5 text-center text-[11.5px] tracking-tight text-slate-400">
                  {affiliateDisclosure}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. 수록 도안 6개 롤링 갤러리 */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-end justify-between px-1">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{getI18nText('preview', 'bundle.preview')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {galUi.countText(totalItems, startIndex + 1, Math.min(startIndex + itemsPerPage, totalItems))}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-bold text-slate-400">
                {galUi.pageText(currentPage, totalPages)}
              </div>
            </div>
          </div>

          {/* 도안 교육적 효과 및 놀이 가이드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* 추천 이유 */}
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-sm sm:text-base">
                <span>{getI18nText('recommend', 'bundle.recommend')}</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 space-y-1.5 whitespace-pre-line leading-relaxed font-medium">
                {(bundle as any)?.[`recommend_${lang}`] || bundle.recommend_reason || '• 아이들의 상상력과 창의력을 쑥쑥 키워줘요.\n• 굵고 또렷한 외곽선으로 손쉬운 소근육 발달을 도와요.'}
              </div>
            </div>

            {/* 활용 놀이법 */}
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2 text-emerald-900 font-bold text-sm sm:text-base">
                <span>{getI18nText('play', 'bundle.play')}</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 space-y-1.5 whitespace-pre-line leading-relaxed font-medium">
                {(bundle as any)?.[`play_${lang}`] || bundle.how_to_play || '• 쥐기 편한 크레용이나 사인펜으로 자유롭게 색칠해보세요.\n• 완성된 도안을 선을 따라 오려 벽면 갤러리를 만들어보세요.'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {currentSlugs.map((itemSlug, idx) => {
              const actualIdx = startIndex + idx + 1;
              const matched = (printables as any[])?.find(
                (p) => p.slug === itemSlug || p.id === itemSlug
              );
              const itemTitle =
                matched?.[`title_${lang}`] ||
                matched?.title_ko ||
                matched?.title ||
                itemSlug;
              const primarySuffix = viewMode === 'bw' ? 'b' : 'c';
              const altSuffix = viewMode === 'bw' ? 'c' : 'b';
              const r2Base =
                import.meta.env.VITE_R2_PUBLIC_BASE_URL ||
                'https://pub-1c8b49597bc74e7b9406c9d7110f708d.r2.dev';
              const cdnBase = import.meta.env.VITE_CDN_URL || 'https://cdn.doolia.app';

              return (
                <div
                  key={itemSlug}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col"
                >
                  <div className="relative aspect-square w-full rounded-xl bg-slate-50 overflow-hidden mb-2.5 flex items-center justify-center p-2">
                    <img
                      key={`${itemSlug}-${viewMode}`}
                      src={`${cdnBase}/printables/${itemSlug}_${primarySuffix}.webp`}
                      alt={itemTitle}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.dataset.fallbackStep) {
                          target.dataset.fallbackStep = '1';
                          target.src = `${cdnBase}/printables/${itemSlug}_${altSuffix}.webp`;
                        } else if (target.dataset.fallbackStep === '1') {
                          target.dataset.fallbackStep = '2';
                          target.src = `${r2Base}/printables/${itemSlug}_${primarySuffix}.webp`;
                        } else if (target.dataset.fallbackStep === '2') {
                          target.dataset.fallbackStep = '3';
                          target.src = `${r2Base}/printables/${itemSlug}_${altSuffix}.webp`;
                        }
                      }}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-700 shadow-sm border border-slate-100">
                      #{actualIdx}
                    </span>
                  </div>
                  <p
                    className="text-xs sm:text-sm font-medium text-slate-700 text-center line-clamp-1 mt-2 px-1 tracking-tight"
                    title={itemTitle}
                  >
                    {itemTitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-200 transition cursor-pointer disabled:cursor-not-allowed"
              >
                {galUi.prev}
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-200 transition cursor-pointer disabled:cursor-not-allowed"
              >
                {galUi.next}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
