import { readFileSync } from 'fs'
import { join } from 'path'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Guide - Katy Pride',
  description: 'Comprehensive guide for managing the Katy Pride website',
}

// Simple markdown parser for basic formatting
function parseMarkdown(markdown: string) {
  let html = markdown
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
  
  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
  
  // Numbered lists
  html = html.replace(/^\d+\. (.*)$/gim, '<li class="ml-4">$1</li>')
  
  // Wrap consecutive numbered list items in ol tags
  html = html.replace(/(<li class="ml-4">.*<\/li>\s*)+/g, (match) => {
    // Check if this looks like a numbered list (starts with a number in original)
    if (match.match(/^\d+\./)) {
      return `<ol class="list-decimal ml-6 mb-4 space-y-1">${match}</ol>`
    }
    return `<ul class="list-disc ml-6 mb-4 space-y-1">${match}</ul>`
  })
  
  // Bullet and dash lists
  html = html.replace(/^[\*\-] (.*)$/gim, '<li class="ml-4">$1</li>')
  
  // Wrap consecutive bullet list items in ul tags
  html = html.replace(/(<li class="ml-4">.*<\/li>\s*)+/g, (match) => {
    return `<ul class="list-disc ml-6 mb-4 space-y-1">${match}</ul>`
  })
  
  // Code blocks
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
  
  // Remove horizontal rules (---) completely
  html = html.replace(/^---$/gim, '')
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p class="mb-4">')
  html = '<p class="mb-4">' + html + '</p>'
  
  // Clean up empty paragraphs
  html = html.replace(/<p class="mb-4"><\/p>/g, '')
  html = html.replace(/<p class="mb-4"><h/g, '<h')
  html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>')
  html = html.replace(/<p class="mb-4"><ul/g, '<ul')
  html = html.replace(/<\/ul><\/p>/g, '</ul>')
  
  return html
}

export default function AdminGuidePage() {
  // Read the markdown file
  const filePath = join(process.cwd(), 'ADMIN_GUIDE.md')
  const content = readFileSync(filePath, 'utf8')
  const htmlContent = parseMarkdown(content)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Admin Guide</h1>
            <p className="text-gray-600">
              Comprehensive guide for managing the Katy Pride website
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div 
                className="text-gray-900 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
