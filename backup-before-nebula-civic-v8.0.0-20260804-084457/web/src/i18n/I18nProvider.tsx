import { useMemo, useState, type PropsWithChildren } from 'react'
import { I18nContext, type Language } from './I18nContext'
import { translations } from './translations'

const STORAGE_KEY = 'census.language'

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'mg' || saved === 'en' || saved === 'fr' ? saved : 'fr'
  })

  const value = useMemo(() => ({
    language,
    setLanguage: (next: Language) => {
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.lang = next
      setLanguageState(next)
    },
    t: (key: keyof typeof translations.fr) => translations[language][key],
  }), [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
