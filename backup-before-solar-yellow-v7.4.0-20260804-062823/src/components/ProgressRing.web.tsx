import type { CSSProperties } from 'react'
import { useCensusTheme } from '../styles/censusTheme'

export default function ProgressRing({ value, size = 88, strokeWidth = 9, label = 'Terminé' }: { value: number; size?: number; strokeWidth?: number; label?: string }) {
  const { palette, isDark } = useCensusTheme()
  const safeValue = Math.max(0, Math.min(100, value))
  const innerSize = Math.max(0, size - strokeWidth * 2)
  const outerStyle: CSSProperties = {
    width: size, height: size, minWidth: size, minHeight: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `conic-gradient(${palette.primary} ${safeValue * 3.6}deg, ${palette.primarySoft} 0deg)`,
    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.30)' : '0 8px 24px rgba(36,87,214,0.12)',
  }
  const innerStyle: CSSProperties = { width: innerSize, height: innerSize, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, boxSizing: 'border-box' }
  const valueStyle: CSSProperties = { margin: 0, color: palette.text, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 20, lineHeight: '22px', fontWeight: 900 }
  const labelStyle: CSSProperties = { margin: '2px 0 0', color: palette.textMuted, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 8, lineHeight: '10px', fontWeight: 700 }
  return <div aria-label={`${safeValue}% ${label}`} role="img" style={outerStyle}><div style={innerStyle}><span style={valueStyle}>{safeValue}%</span><span style={labelStyle}>{label}</span></div></div>
}
