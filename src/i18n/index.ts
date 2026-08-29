import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

const resources = {
  ko: {
    translation: {
      nav: {
                    home: '홈',
        coloring: '🎨 색칠공부',
        brain: '🧠 두뇌발달',
        habit: '🏡 루틴/습관',
        tips: '📖 육아·놀이 팁',
        premium: '🎁 프리미엄 묶음',
        cta: '무료 도안 보기',
      },
      language: '언어',
    },
  },
  en: {
    translation: {
      nav: {
                    home: 'Home',
        coloring: '🎨 Coloring',
        brain: '🧠 Brain (I Spy / Maze)',
        habit: '🏡 Routines',
        tips: '📖 Parenting Tips',
        premium: '🎁 Premium Bundle',
        cta: 'Browse free printables',
      },
      language: 'Language',
    },
  },
  ja: {
    translation: {
      nav: {
                    home: 'ホーム',
        coloring: '🎨 ぬりえ',
        brain: '🧠 脳育（I Spy / 迷路）',
        habit: '🏡 ルーティン',
        tips: '📖 育児・遊びのヒント',
        premium: '🎁 プレミアムセット',
        cta: '無料プリントを見る',
      },
      language: '言語',
    },
  },
  es: {
    translation: {
      nav: {
                    home: 'Inicio',
        coloring: '🎨 Colorear',
        brain: '🧠 Cerebro (I Spy / Laberinto)',
        habit: '🏡 Rutinas',
        tips: '📖 Consejos para padres',
        premium: '🎁 Pack premium',
        cta: 'Ver plantillas gratis',
      },
      language: 'Idioma',
    },
  },
  de: {
    translation: {
      nav: {
                    home: 'Start',
        coloring: '🎨 Ausmalen',
        brain: '🧠 Gehirn (I Spy / Labyrinth)',
        habit: '🏡 Routinen',
        tips: '📖 Tipps für Eltern',
        premium: '🎁 Premium-Paket',
        cta: 'Kostenlose Vorlagen',
      },
      language: 'Sprache',
    },
  },
  fr: {
    translation: {
      nav: {
                    home: 'Accueil',
        coloring: '🎨 Coloriage',
        brain: '🧠 Cerveau (I Spy / Labyrinthe)',
        habit: '🏡 Routines',
        tips: '📖 Conseils parents',
        premium: '🎁 Pack premium',
        cta: 'Voir les imprimés gratuits',
      },
      language: 'Langue',
    },
  },
}

void i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('doolia-lang') || 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
})

document.documentElement.lang = i18n.resolvedLanguage || 'ko'

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('doolia-lang', lng)
  document.documentElement.lang = lng
})

export default i18n
