'use client'

import React from 'react'

interface StrapiRichTextProps {
  content: any // Strapi blocks content
  className?: string
}

// URL validation to prevent XSS attacks
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

const StrapiRichText: React.FC<StrapiRichTextProps> = ({ content, className = '' }) => {
  if (!content || !Array.isArray(content)) {
    return null
  }

  const renderNode = (node: any, index: number) => {
    if (!node || typeof node !== 'object') return null

    // Handle text nodes
    if (node.type === 'text') {
      let text = node.text || ''
      
      // Apply text formatting
      if (node.bold) {
        text = <strong key={index}>{text}</strong>
      }
      if (node.italic) {
        text = <em key={index}>{text}</em>
      }
      if (node.underline) {
        text = <u key={index}>{text}</u>
      }
      if (node.strikethrough) {
        text = <s key={index}>{text}</s>
      }
      if (node.code) {
        text = <code key={index} className="bg-gray-100 px-1 py-0.5 rounded text-sm">{text}</code>
      }

      return text
    }

    // Handle paragraph
    if (node.type === 'paragraph') {
      if (!node.children || node.children.length === 0) {
        return null
      }
      
      return (
        <p key={index} className={`mb-4 last:mb-0 ${className}`}>
          {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </p>
      )
    }

    // Handle headings
    if (node.type === 'heading') {
      const level = node.level || 2
      const headingClasses = {
        1: 'text-3xl font-bold mb-4',
        2: 'text-2xl font-bold mb-3',
        3: 'text-xl font-bold mb-2',
        4: 'text-lg font-bold mb-2',
        5: 'text-base font-bold mb-2',
        6: 'text-sm font-bold mb-1',
      }
      
      if (level === 1) {
        return (
          <h1 key={index} className={headingClasses[1]}>
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </h1>
        )
      } else if (level === 2) {
        return (
          <h2 key={index} className={headingClasses[2]}>
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </h2>
        )
      } else if (level === 3) {
        return (
          <h3 key={index} className={headingClasses[3]}>
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </h3>
        )
      } else if (level === 4) {
        return (
          <h4 key={index} className={headingClasses[4]}>
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </h4>
        )
      } else if (level === 5) {
        return (
          <h5 key={index} className={headingClasses[5]}>
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </h5>
        )
      } else {
        return (
          <h6 key={index} className={headingClasses[6]}>
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </h6>
        )
      }
    }

    // Handle lists
    if (node.type === 'list') {
      const ListTag = node.format === 'ordered' ? 'ol' : 'ul'
      const listClasses = node.format === 'ordered' ? 'list-decimal list-inside mb-4' : 'list-disc list-inside mb-4'
      
      return (
        <ListTag key={index} className={listClasses}>
          {node.children?.map((listItem: any, listItemIndex: number) => (
            <li key={listItemIndex} className="mb-1">
              {listItem.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
            </li>
          ))}
        </ListTag>
      )
    }

    // Handle links
    if (node.type === 'link') {
      if (!node.url || !isValidUrl(node.url)) {
        return (
          <span key={index} className="text-red-600">
            [Invalid link]
          </span>
        )
      }
      
      return (
        <a
          key={index}
          href={node.url}
          target={node.url?.startsWith('http') ? '_blank' : '_self'}
          rel={node.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </a>
      )
    }

    // Handle quotes
    if (node.type === 'quote') {
      return (
        <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic mb-4">
          {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </blockquote>
      )
    }

    // Handle code blocks
    if (node.type === 'code') {
      return (
        <pre key={index} className="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
          <code className="text-sm">{node.code || ''}</code>
        </pre>
      )
    }

    // Handle images
    if (node.type === 'image') {
      const image = node.image
      if (!image || !image.url) {
        return null
      }
      
      if (!isValidUrl(image.url) && !image.url.startsWith('/')) {
        return (
          <div key={index} className="text-red-600 p-2 border border-red-200 rounded">
            [Invalid image URL]
          </div>
        )
      }
      
      return (
        <img
          key={index}
          src={image.url}
          alt={image.alternativeText || ''}
          className="max-w-full h-auto rounded-lg mb-4"
          loading="lazy"
        />
      )
    }

    // Handle other nodes recursively
    if (node.children && Array.isArray(node.children)) {
      return (
        <div key={index}>
          {node.children.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </div>
      )
    }

    return null
  }

  return (
    <div className="prose prose-sm max-w-none">
      {content.map((node: any, index: number) => renderNode(node, index))}
    </div>
  )
}

export default StrapiRichText
