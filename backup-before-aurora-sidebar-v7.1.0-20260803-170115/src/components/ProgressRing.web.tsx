import type { CSSProperties } from 'react'
import { colors } from '../styles/theme'

export default function ProgressRing({
  value,
  size = 88,
  strokeWidth = 9,
  label = 'Terminé',
}: {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
}) {
  const safeValue = Math.max(0, Math.min(100, value))
  const innerSize = Math.max(0, size - strokeWidth * 2)

  const outerStyle: CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `conic-gradient(${String(colors.primary)} ${safeValue * 3.6}deg, #DBEAFE 0deg)`,
    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.12)',
  }

  const innerStyle: CSSProperties = {
    width: innerSize,
    height: innerSize,
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
  }

  const valueStyle: CSSProperties = {
    margin: 0,
    color: String(colors.text),
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 20,
    lineHeight: '22px',
    fontWeight: 900,
  }

  const labelStyle: CSSProperties = {
    margin: '2px 0 0',
    color: String(colors.muted),
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 8,
    lineHeight: '10px',
    fontWeight: 700,
  }

  return (
    <div
      aria-label={`${safeValue}% ${label}`}
      role="img"
      style={outerStyle}
    >
      <div style={innerStyle}>
        <span style={valueStyle}>{safeValue}%</span>
        <span style={labelStyle}>{label}</span>
      </div>
    </div>
  )
}
