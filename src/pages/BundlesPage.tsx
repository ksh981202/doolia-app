import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBundles } from '../services/adminBundleService';
import type { AdminBundle } from '../services/adminBundleService';

const I18N_BUNDLES_PAGE: Record<
  string,
  { title: string; subtitle: string; viewBtn: string; sheetBadge: (n: number) => string }
> = {
  ko: {
    title: '테마별 색칠도안 모음집',
    subtitle: '원하는 테마만 쏙쏙! 다양한 테마별 모음집을 쉽고 빠르게 받아보세요.',
    viewBtn: '모음집 바로보기 →',
    sheetBadge: (n) => `📄 ${n}장 수록 · 고화질 프린트`,
  },
  en: {
    title: 'Themed Coloring Packs',
    subtitle: 'Find your favorite themes and download full packs in one click!',
    viewBtn: 'View Collection →',
    sheetBadge: (n) => `📄 ${n} Sheets · High-Res Print`,
  },
  ja: {
    title: 'テーマ別 ぬりえコレクション',
    subtitle: 'お気に入りのテーマをまとめて簡単・快適に一括ダウンロード！',
    viewBtn: 'コレクションを見る →',
    sheetBadge: (n) => `📄 ${n}枚収録・高画質印刷`,
  },
  zh: {
    title: '主題著色畫精選集',
    subtitle: '輕鬆挑選喜愛的主題，一鍵快速下載整套著色畫！',
    viewBtn: '查看精選集 →',
    sheetBadge: (n) => `📄 收錄 ${n} 張 · 高畫質列印`,
  },
  es: {
    title: 'Colecciones Temáticas para Colorear',
    subtitle: '¡Elige tus temas favoritos y descarga paquetes completos con un clic!',
    viewBtn: 'Ver Colección →',
    sheetBadge: (n) => `📄 ${n} Láminas · Impresión HD`,
  },
  pt: {
    title: 'Coleções Temáticas para Colorir',
    subtitle: 'Escolha seus temas favoritos e baixe coleções completas em um clique!',
    viewBtn: 'Ver Coleção →',
    sheetBadge: (n) => `📄 ${n} Desenhos · Impressão HD`,
  },
  de: {
    title: 'Thematische Malvorlagen-Pakete',
    subtitle: 'Wählen Sie Lieblingsthemen und laden Sie Komplettpakete mit einem Klick herunter!',
    viewBtn: 'Paket Ansehen →',
    sheetBadge: (n) => `📄 ${n} Vorlagen · HD-Druck`,
  },
  fr: {
    title: 'Cahiers de Coloriage Thématiques',
    subtitle: 'Choisissez vos thèmes favoris et téléchargez des livrets complets en un clic !',
    viewBtn: 'Voir le Cahier →',
    sheetBadge: (n) => `📄 ${n} Feuilles · Impression HD`,
  },
  it: {
    title: 'Raccolte Tematiche da Colorare',
    subtitle: 'Scegli i tuoi temi preferiti e scarica le raccolte complete in un clic!',
    viewBtn: 'Vedi Raccolta →',
    sheetBadge: (n) => `📄 ${n} Disegni · Stampa HD`,
  },
  vi: {
    title: 'Bộ Tranh Tô Màu Theo Chủ Đề',
    subtitle: 'Chọn chủ đề yêu thích và tải trọn bộ tranh tô màu chỉ với một cú nhấp!',
    viewBtn: 'Xem Tuyển Tập →',
    sheetBadge: (n) => `📄 ${n} Tranh · In Chất Lượng Cao`,
  },
};


export default function BundlesPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'ko').slice(0, 2);
  const ui = I18N_BUNDLES_PAGE[lang] || I18N_BUNDLES_PAGE.en || I18N_BUNDLES_PAGE.ko;

  const [bundles, setBundles] = useState<AdminBundle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getBundles()
      .then((data) => {
        setBundles(data || []);
      })
      .catch((err) => {
        console.error(err);
        setBundles([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* 1. 상단 DOOLIA THEME CURATION 헤더 */}
      <div className="bg-white border-b border-slate-100 py-12 mb-10 text-center">
        <div className="inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 mb-3 shadow-xs">
          ✨ DOOLIA THEME CURATION
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-2">
          {ui.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-normal max-w-xl mx-auto px-4">
          {ui.subtitle}
        </p>
      </div>

      {/* 2. 3열 카드 그리드 (라운드 & 깊은 그림자 책 표지 비주얼) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 min-h-[360px]">
            <div className="w-9 h-9 border-3 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 max-w-md mx-auto">
            <span className="text-4xl mb-3 block">📚</span>
            <p className="text-slate-600 font-medium">발행된 모음집이 아직 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">곧 새로운 테마 모음집이 업데이트됩니다!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundles.map((bundle) => {
              const count = bundle.item_slugs?.length || 10;
              const bundleTitle =
                (bundle as Record<string, any>)[`title_${lang}`] ||
                bundle.title_ko ||
                (bundle as Record<string, any>).title_en ||
                '';

              return (
                <Link
                  key={bundle.id}
                  to={`/bundles/${bundle.slug}`}
                  className="group flex flex-col justify-between bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* [책 표지 비주얼] (라운드 & 깊은 그림자) */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-[0_12px_28px_-6px_rgba(0,0,0,0.2),0_4px_12px_-2px_rgba(0,0,0,0.12)] border border-slate-200/70 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:scale-[1.02] group-hover:shadow-[0_20px_35px_-8px_rgba(16,185,129,0.24),0_8px_16px_-4px_rgba(0,0,0,0.15)] transition-all duration-500">
                    <img
                      src={
                        bundle.cover_image_url ||
                        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={bundleTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* 책 표지 느낌을 더해주는 입체 책등 음영 & 테두리 */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/25 via-white/10 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
                  </div>

                  {/* 도안 수록 정보 & 제목 & 버튼 */}
                  <div className="mt-5 flex flex-col flex-grow justify-between">
                    <div>
                      {/* 수록 장수 정보 */}
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100/80 rounded-lg px-2.5 py-1 mb-2.5">
                        <span>{ui.sheetBadge(count)}</span>
                      </div>

                      {/* 몽실몽실 구름섬과 달콤한 과자나라 컬러링북 30선 */}
                      <h2 className="text-base sm:text-lg font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1 leading-snug">
                        {bundleTitle}
                      </h2>
                    </div>

                    {/* [ 📥 모음집 바로보기  →] */}
                    <div className="mt-5 w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/25 group-hover:bg-emerald-700 transition-colors">
                      <span>{ui.viewBtn}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


