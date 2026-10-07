import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '繁體中文', flag: '🇹🇼' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

const loaded = new Set<string>()
let loadSeq = 0

function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((item) => item.code === value)
}

export function resolveLanguage(lang: string | null | undefined): LanguageCode {
  const raw = (lang || '').toLowerCase()
  if (!raw) return 'ko'
  const short = raw.startsWith('zh') ? 'zh' : raw.slice(0, 2)
  return isLanguageCode(short) ? short : 'ko'
}

export function detectLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem('doolia-lang')
    if (saved) return resolveLanguage(saved)
  } catch {
    /* ignore */
  }
  try {
    const nav = navigator.language || navigator.languages?.[0]
    if (nav) return resolveLanguage(nav)
  } catch {
    /* ignore */
  }
  return 'ko'
}

async function importLocale(lang: LanguageCode) {
  const resource = await import(`./locales/${lang}.json`)
  return resource.default as Record<string, unknown>
}

export async function loadLocaleResource(lang: string) {
  const code = resolveLanguage(lang)
  const seq = ++loadSeq
  if (!loaded.has(code)) {
    const dictionary = await importLocale(code)
    i18n.addResourceBundle(code, 'translation', dictionary, true, true)
    loaded.add(code)
  }
  if (seq !== loadSeq) return
  await i18n.changeLanguage(code)
}

void i18n.use(initReactI18next)

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('doolia-lang', lng)
  } catch {
    /* ignore */
  }
  if (typeof document !== 'undefined') document.documentElement.lang = lng
})

export async function initI18n() {
  const lng = detectLanguage()
  if (!i18n.isInitialized) {
    await i18n.init({
      lng,
      fallbackLng: lng,
      supportedLngs: LANGUAGES.map((item) => item.code),
      nonExplicitSupportedLngs: true,
      load: 'languageOnly',
      partialBundledLanguages: true,
      interpolation: { escapeValue: false },
      resources: {},
    })
  }
  await loadLocaleResource(lng)
  if (typeof document !== 'undefined') document.documentElement.lang = i18n.resolvedLanguage || lng
}

export default i18n
