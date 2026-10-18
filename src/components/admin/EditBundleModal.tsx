import { useState, useEffect } from 'react'
import { X, Copy, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { updateBundle, type AdminBundle } from '@/services/adminBundleService'

interface EditBundleModalProps {
  isOpen: boolean
  onClose: () => void
  bundle: AdminBundle | null
  onSuccess: () => void
}

const AFFILIATE_OPTIONS = [
  { value: 'scissors', label: '✂️ 둥근 안전가위' },
  { value: 'crayon', label: '🎨 무독성 유아 크레용' },
  { value: 'marker', label: '🖍️ 워셔블 마커' },
]

export default function EditBundleModal({
  isOpen,
  onClose,
  bundle,
  onSuccess,
}: EditBundleModalProps) {
  const [copied, setCopied] = useState(false)
  const [aiInputText, setAiInputText] = useState('')
  const [isAiBoxOpen, setIsAiBoxOpen] = useState(true)
  const [parsedToast, setParsedToast] = useState(false)

  const [formData, setFormData] = useState({
    title_ko: '',
    title_en: '',
    title_ja: '',
    title_zh: '',
    title_es: '',
    title_pt: '',
    title_de: '',
    title_fr: '',
    title_it: '',
    title_vi: '',
    recommend_ko: '',
    recommend_en: '',
    recommend_ja: '',
    recommend_zh: '',
    recommend_es: '',
    recommend_pt: '',
    recommend_de: '',
    recommend_fr: '',
    recommend_it: '',
    recommend_vi: '',
    play_ko: '',
    play_en: '',
    play_ja: '',
    play_zh: '',
    play_es: '',
    play_pt: '',
    play_de: '',
    play_fr: '',
    play_it: '',
    play_vi: '',
    slug: '',
    age_group: '',
    recommend_reason: '',
    how_to_play: '',
    affiliate_id: 'scissors',
    cover_image_url: '',
    pdf_download_url: '',
    raw_i18n: '',
    full_content: '',
  })

  useEffect(() => {
    if (bundle) {
      const bundleAny = bundle as unknown as Record<string, unknown>
      const recReason = bundle.recommend_reason || bundle.recommend_ko || ''
      const playGuide = bundle.how_to_play || bundle.play_ko || ''
      setFormData({
        title_ko: bundle.title_ko || '',
        title_en: bundle.title_en || '',
        title_ja: bundle.title_ja || '',
        title_zh: bundle.title_zh || '',
        title_es: bundle.title_es || '',
        title_pt: bundle.title_pt || '',
        title_de: bundle.title_de || '',
        title_fr: bundle.title_fr || '',
        title_it: bundle.title_it || '',
        title_vi: bundle.title_vi || '',
        recommend_ko: bundle.recommend_ko || recReason,
        recommend_en: bundle.recommend_en || '',
        recommend_ja: bundle.recommend_ja || '',
        recommend_zh: bundle.recommend_zh || '',
        recommend_es: bundle.recommend_es || '',
        recommend_pt: bundle.recommend_pt || '',
        recommend_de: bundle.recommend_de || '',
        recommend_fr: bundle.recommend_fr || '',
        recommend_it: bundle.recommend_it || '',
        recommend_vi: bundle.recommend_vi || '',
        play_ko: bundle.play_ko || playGuide,
        play_en: bundle.play_en || '',
        play_ja: bundle.play_ja || '',
        play_zh: bundle.play_zh || '',
        play_es: bundle.play_es || '',
        play_pt: bundle.play_pt || '',
        play_de: bundle.play_de || '',
        play_fr: bundle.play_fr || '',
        play_it: bundle.play_it || '',
        play_vi: bundle.play_vi || '',
        slug: bundle.slug || '',
        age_group: bundle.age_group || '만 2~4세',
        recommend_reason: recReason,
        how_to_play: playGuide,
        affiliate_id: bundle.affiliate_id || 'scissors',
        cover_image_url: bundle.cover_image_url || '',
        pdf_download_url: bundle.pdf_download_url || '',
        raw_i18n: typeof bundleAny.raw_i18n === 'string' ? bundleAny.raw_i18n : '',
        full_content: typeof bundleAny.full_content === 'string' ? bundleAny.full_content : '',
      })
      setCopied(false)
      setAiInputText('')
      setParsedToast(false)
    }
  }, [bundle])

  const autoParseAiText = (text: string) => {
    setAiInputText(text)
    if (!text.trim()) return

    // 1. slug 추출 (- slug: 또는 slug:)
    const slugMatch = text.match(/(?:-\s*)?slug:\s*([^\r\n]+)/i)
    const slug = slugMatch ? slugMatch[1].trim() : ''

    // 2. age_group 추출
    const ageMatch = text.match(/(?:-\s*)?age_group:\s*([^\r\n]+)/i)
    const ageGroup = ageMatch ? ageMatch[1].trim() : ''

    // 3. 10개 언어별 필드 파싱
    const languages = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'vi'] as const
    const parsedTitles: Record<string, string> = {}
    const parsedRecommends: Record<string, string> = {}
    const parsedPlays: Record<string, string> = {}

    languages.forEach((lang) => {
      // title_{lang}
      const titleMatch = text.match(new RegExp(`(?:-\\s*)?title_${lang}:\\s*([^\\r\\n]+)`, 'i'))
      if (titleMatch && titleMatch[1].trim()) {
        parsedTitles[`title_${lang}`] = titleMatch[1].trim()
      }

      // recommend_{lang} (불렛 2줄 또는 단일 텍스트)
      const recMatch = text.match(new RegExp(`recommend_${lang}:[\\s\\S]*?(?:•|-)\\s*([^\\r\\n]+)[\\r\\n]+(?:\\s*(?:•|-)\\s*([^\\r\\n]+))?`, 'i'))
      if (recMatch) {
        const line1 = recMatch[1] ? recMatch[1].trim() : ''
        const line2 = recMatch[2] ? recMatch[2].trim() : ''
        parsedRecommends[`recommend_${lang}`] = line2 ? `• ${line1}\n• ${line2}` : (line1 ? `• ${line1}` : '')
      } else {
        const singleRec = text.match(new RegExp(`(?:-\\s*)?recommend_${lang}:\\s*([^\\r\\n]+)`, 'i'))
        if (singleRec && singleRec[1].trim()) {
          parsedRecommends[`recommend_${lang}`] = singleRec[1].trim()
        }
      }

      // play_{lang} (불렛 2줄 또는 단일 텍스트)
      const playMatch = text.match(new RegExp(`play_${lang}:[\\s\\S]*?(?:•|-)\\s*([^\\r\\n]+)[\\r\\n]+(?:\\s*(?:•|-)\\s*([^\\r\\n]+))?`, 'i'))
      if (playMatch) {
        const line1 = playMatch[1] ? playMatch[1].trim() : ''
        const line2 = playMatch[2] ? playMatch[2].trim() : ''
        parsedPlays[`play_${lang}`] = line2 ? `• ${line1}\n• ${line2}` : (line1 ? `• ${line1}` : '')
      } else {
        const singlePlay = text.match(new RegExp(`(?:-\\s*)?play_${lang}:\\s*([^\\r\\n]+)`, 'i'))
        if (singlePlay && singlePlay[1].trim()) {
          parsedPlays[`play_${lang}`] = singlePlay[1].trim()
        }
      }
    })

    // 4. 제휴 상품 매칭
    let affiliateId = 'scissors'
    const affMatch = text.match(/(?:recommended_affiliate|affiliate_tool):\s*([^\r\n]+)/i)
    const affText = affMatch ? affMatch[1] : text
    if (/크레용|크레파스/i.test(affText)) {
      affiliateId = 'crayon'
    } else if (/마커|사인펜/i.test(affText)) {
      affiliateId = 'marker'
    } else {
      affiliateId = 'scissors'
    }

    const finalRecKo = parsedRecommends.recommend_ko
    const finalPlayKo = parsedPlays.play_ko

    setFormData((prev) => ({
      ...prev,
      raw_i18n: text,
      full_content: text,
      ...(slug ? { slug } : {}),
      ...(ageGroup ? { age_group: ageGroup } : {}),
      ...parsedTitles,
      ...parsedRecommends,
      ...parsedPlays,
      ...(finalRecKo ? { recommend_reason: finalRecKo, recommend_ko: finalRecKo } : {}),
      ...(finalPlayKo ? { how_to_play: finalPlayKo, play_ko: finalPlayKo } : {}),
      affiliate_id: affiliateId,
    }))

    setParsedToast(true)
    setTimeout(() => {
      setParsedToast(false)
    }, 4000)
  }

  if (!isOpen || !bundle) return null

  const titles10 = (bundle.item_titles || []).slice(0, 10).join('\n')

  const handleCopyTitles = async () => {
    if (!titles10) return
    try {
      await navigator.clipboard.writeText(titles10)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const handleSave = async (publishStatus: 'draft' | 'published' = 'published') => {
    if (!bundle?.id) return;

    try {
      // UI 전용 필드 제외 및 DB 페이로드 정제
      const { raw_i18n, full_content, ...cleanData } = (formData as any);

      const payload = {
        ...cleanData,
        status: publishStatus,
      };

      // Supabase DB 업데이트 완료 대기
      await updateBundle(bundle.id, payload);

      // 부모 목록 비동기 갱신 대기 후 모달 닫기
      await onSuccess?.();
      onClose();
    } catch (error) {
      console.error('모음집 저장 실패:', error);
      alert('모음집 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>📚 모음집 상세 편집 & 발행</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 영역 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1구역: AI 프롬프트용 대표 도안 제목 10개 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                AI 프롬프트용 대표 도안 제목 10개
              </label>
              <button
                type="button"
                onClick={handleCopyTitles}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition border border-emerald-200/60"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>📋 AI 요청용 제목 10개 복사</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-200/70 max-h-36 overflow-y-auto">
              {titles10 || '포함된 도안 제목이 없습니다.'}
            </pre>
          </div>

          {/* AI 텍스트 일괄 붙여넣기 영역 (Smart Auto-Fill) */}
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  🪄 AI 결과 텍스트 일괄 붙여넣기
                </span>
                {parsedToast && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-in fade-in zoom-in-95 duration-200">
                    ✨ 모든 항목이 자동으로 채워졌습니다!
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsAiBoxOpen((prev) => !prev)}
                className="text-xs text-indigo-700 hover:text-indigo-900 flex items-center gap-0.5 font-medium px-2 py-0.5 rounded hover:bg-indigo-100/70 transition"
              >
                {isAiBoxOpen ? (
                  <>
                    <span>접기</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>펼치기</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {isAiBoxOpen && (
              <div className="space-y-1.5">
                <textarea
                  rows={4}
                  value={aiInputText}
                  onChange={(e) => autoParseAiText(e.target.value)}
                  placeholder="AI가 생성한 전체 결과 텍스트를 여기에 통째로 붙여넣으세요. 아래 모든 항목이 자동으로 채워집니다!"
                  className="w-full px-3 py-2 text-xs md:text-sm font-mono border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-slate-400"
                />
                <p className="text-[11px] text-indigo-600/80">
                  💡 slug, age_group, title_ko, title_en, recommend_ko, play_ko, recommended_affiliate 항목이 자동 파싱되어 하단 폼에 채워집니다.
                </p>
              </div>
            )}
          </div>

          {/* 2구역: 편집 입력 폼 */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  모음집 제목 (한국어)
                </label>
                <input
                  type="text"
                  value={formData.title_ko}
                  onChange={(e) => setFormData({ ...formData, title_ko: e.target.value })}
                  placeholder="예: 공룡 색칠놀이 30선 모음"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  모음집 제목 (영어)
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="예: 30 Dinosaur Coloring Pages"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL 슬러그
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="dinosaur-bundle"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  추천 연령
                </label>
                <input
                  type="text"
                  value={formData.age_group}
                  onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                  placeholder="만 2~4세"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                💡 추천 이유
              </label>
              <textarea
                rows={2}
                value={formData.recommend_reason}
                onChange={(e) => setFormData({ ...formData, recommend_reason: e.target.value, recommend_ko: e.target.value })}
                placeholder="아이들의 소근육 발달과 색채 감각을 길러주는 데 탁월합니다."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ✂️ 놀이 및 활용법
              </label>
              <textarea
                rows={2}
                value={formData.how_to_play}
                onChange={(e) => setFormData({ ...formData, how_to_play: e.target.value, play_ko: e.target.value })}
                placeholder="도안을 따라 선을 긋고 원하는 색으로 자유롭게 칠하며 이야기를 나눠보세요."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                제휴 상품
              </label>
              <select
                value={formData.affiliate_id}
                onChange={(e) => setFormData({ ...formData, affiliate_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                {AFFILIATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  표지 이미지 URL
                </label>
                <input
                  type="text"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  30장 PDF 다운로드 URL
                </label>
                <input
                  type="text"
                  value={formData.pdf_download_url}
                  onChange={(e) => setFormData({ ...formData, pdf_download_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
          >
            임시 저장
          </button>
          <button
            type="button"
            onClick={() => handleSave('published')}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
          >
            🚀 최종 모음집 발행하기
          </button>
        </div>
      </div>
    </div>
  )
}
