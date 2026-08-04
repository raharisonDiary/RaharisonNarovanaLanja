import { Languages, Moon, Sun } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n'
import type { Language } from '../../i18n/I18nContext'
import { useTheme } from '../../theme/useTheme'

export default function PreferencesControls({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n()
  const { resolved, setMode } = useTheme()
  return (
    <div className={`preferences-controls ${compact ? 'preferences-controls--compact' : ''}`}>
      <label title={t('language')}><Languages size={16} /><select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label={t('language')}><option value="mg">MG</option><option value="fr">FR</option><option value="en">EN</option></select></label>
      <button type="button" className="icon-button" onClick={() => setMode(resolved === 'dark' ? 'light' : 'dark')} title={resolved === 'dark' ? t('light') : t('dark')} aria-label={resolved === 'dark' ? t('light') : t('dark')}>{resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
    </div>
  )
}
