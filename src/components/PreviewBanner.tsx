'use client'

export function PreviewBanner() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fbbf24',
      color: '#92400e',
      padding: '8px 16px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '600',
      zIndex: 9999,
      borderBottom: '1px solid #f59e0b'
    }}>
      📋 Preview Mode - Showing unpublished changes
    </div>
  )
}
