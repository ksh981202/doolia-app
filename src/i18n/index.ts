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
        playToolbox: '맞춤 놀이 도구함',
        coloring: '색칠·창의',
        brain: '두뇌·학습',
        tips: '육아·놀이 팁',
        premium: '프리미엄',
        cta: '무료 도안 보기',
      },
      language: '언어',
    },
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        playToolbox: 'Play Toolbox',
        coloring: 'Color & Create',
        brain: 'Brain & Learn',
        tips: 'Parenting Tips',
        premium: 'Premium',
        cta: 'Browse free printables',
      },
      language: 'Language',
    },
  },
  ja: {
    translation: {
      nav: {
        home: 'ホーム',
        playToolbox: 'カスタム遊びツール',
        coloring: 'ぬりえ・創作',
        brain: '脳育・学習',
        tips: '育児・遊びのヒント',
        premium: 'プレミアム',
        cta: '無料プリントを見る',
      },
      language: '言語',
    },
  },
  es: {
    translation: {
      nav: {
        home: 'Inicio',
        playToolbox: 'Caja de juegos',
        coloring: 'Color y creatividad',
        brain: 'Cerebro y aprendizaje',
        tips: 'Consejos para padres',
        premium: 'Premium',
        cta: 'Ver plantillas gratis',
      },
      language: 'Idioma',
    },
  },
  de: {
    translation: {
      nav: {
        home: 'Start',
        playToolbox: 'Spiel-Toolbox',
        coloring: 'Malen & Kreativ',
        brain: 'Gehirn & Lernen',
        tips: 'Tipps für Eltern',
        premium: 'Premium',
        cta: 'Kostenlose Vorlagen',
      },
      language: 'Sprache',
    },
  },
  fr: {
    translation: {
      nav: {
        home: 'Accueil',
        playToolbox: 'Boîte à jeux',
        coloring: 'Colorier et créer',
        brain: 'Cerveau et apprentissage',
        tips: 'Conseils parents',
        premium: 'Premium',
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
