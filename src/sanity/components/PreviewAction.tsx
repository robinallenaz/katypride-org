import React from 'react'

interface PreviewActionProps {
  url: string
  title: string
}

export const PreviewAction: React.FC<PreviewActionProps> = ({ url, title }) => {
  React.useEffect(() => {
    window.open(url, '_blank')
  }, [url])

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h2>{title}</h2>
      <p>Opening preview in new tab...</p>
      <p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Click here if popup was blocked
        </a>
      </p>
    </div>
  )
}
