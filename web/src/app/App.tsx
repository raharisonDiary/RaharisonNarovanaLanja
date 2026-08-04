import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import { I18nProvider } from '../i18n/I18nProvider'
import { ThemeProvider } from '../theme/ThemeProvider'
import AppRoutes from './AppRoutes'

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  )
}
