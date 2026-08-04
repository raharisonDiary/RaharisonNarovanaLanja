import type { MobileLanguage } from '../preferences/PreferencesContext'

export function tr(language: MobileLanguage, fr: string, mg: string, en: string): string {
  return language === 'mg' ? mg : language === 'en' ? en : fr
}
