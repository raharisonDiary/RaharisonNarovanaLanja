import { createContext } from 'react'

export type Language = 'mg' | 'fr' | 'en'
export type TranslationKey = keyof typeof import('./translations').translations.fr

export interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined)
