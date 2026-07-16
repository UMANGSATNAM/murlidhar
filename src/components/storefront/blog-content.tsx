'use client'

import * as React from 'react'
import ReactMarkdown from 'react-markdown'

// Renders blog post content. Handles both Markdown (new, from WYSIWYG editor)
// and legacy HTML content (old posts written as raw HTML).
// Detection: if content starts with `<` and contains HTML tags, render as HTML.
// Otherwise render as Markdown.
export function BlogContent({ content }: { content: string }) {
  const isHtml = /^\s*</.test(content) && /<\/[a-z]+>/i.test(content)

  if (isHtml) {
    return (
      <div
        className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-navy prose-a:text-gold-deep prose-strong:text-navy prose-headings:mt-6 prose-headings:font-bold"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-navy prose-headings:mt-6 prose-headings:font-bold prose-a:text-gold-deep prose-strong:text-navy prose-blockquote:border-l-gold prose-blockquote:bg-secondary/40 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r prose-li:my-1 prose-table:border-collapse prose-th:bg-secondary/40 prose-th:text-navy prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-td:border prose-th:border prose-img:rounded-lg">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h1 className="font-display text-3xl font-bold text-navy mt-8 mb-3" {...props} />,
          h2: ({ node, ...props }) => <h2 className="font-display text-2xl font-bold text-navy mt-6 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="font-display text-xl font-bold text-navy mt-5 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="text-foreground/80 leading-relaxed my-3" {...props} />,
          a: ({ node, ...props }) => <a className="text-gold-deep underline hover:text-teal" target="_blank" rel="noopener noreferrer" {...props} />,
          strong: ({ node, ...props }) => <strong className="text-navy font-semibold" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gold bg-secondary/40 py-2 px-4 rounded-r-md my-4 italic text-foreground/70" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3 space-y-1 text-foreground/80" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3 space-y-1 text-foreground/80" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-6 border-gold/30" {...props} />,
          table: ({ node, ...props }) => <table className="w-full border-collapse my-4 rounded-lg overflow-hidden border border-border" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
