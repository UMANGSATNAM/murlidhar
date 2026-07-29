'use client'

import * as React from 'react'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertTable,
  InsertThematicBreak,
  Separator,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

export function MdxEditor({
  value,
  onChange,
  placeholder = 'Start writing your blog post...',
}: {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
}) {
  // MDXEditor is uncontrolled-ish; we use a key to refresh when value changes externally
  const [initialValue] = React.useState(value || '')

  return (
    <div className="mo-mdx-editor overflow-hidden rounded-md border border-border bg-white">
      <MDXEditor
        markdown={initialValue}
        onChange={onChange}
        placeholder={placeholder}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          tablePlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <Separator />
                <InsertTable />
                <InsertThematicBreak />
              </>
            ),
          }),
        ]}
        contentEditableClassName="prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none"
      />
      <style>{`
        .mo-mdx-editor .mdxeditor {
          border: 0 !important;
        }
        .mo-mdx-editor .mdxeditor-toolbar {
          background: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 6px 8px !important;
        }
        .mo-mdx-editor .mdxeditor-toolbar button {
          color: #0f1b33 !important;
          border-radius: 4px !important;
        }
        .mo-mdx-editor .mdxeditor-toolbar button:hover {
          background: #e2e8f0 !important;
        }
        .mo-mdx-editor .mdxeditor-toolbar button.active {
          background: #0d9488 !important;
          color: #0f1b33 !important;
        }
        .mo-mdx-editor [role="separator"] {
          background: #e2e8f0 !important;
          width: 1px !important;
          margin: 0 4px !important;
        }
        .mo-mdx-editor .mdxeditor-content-editable {
          font-family: var(--font-sans) !important;
          color: #0f1b33 !important;
        }
        .mo-mdx-editor .mdxeditor-content-editable h1,
        .mo-mdx-editor .mdxeditor-content-editable h2,
        .mo-mdx-editor .mdxeditor-content-editable h3 {
          color: #0f1b33 !important;
          font-family: var(--font-display) !important;
        }
        .mo-mdx-editor .mdxeditor-content-editable a {
          color: #0f766e !important;
          text-decoration: underline !important;
        }
        .mo-mdx-editor .mdxeditor-content-editable blockquote {
          border-left-color: #0d9488 !important;
          background: #f8fafc !important;
          padding: 8px 12px !important;
          border-radius: 0 6px 6px 0 !important;
        }
      `}</style>
    </div>
  )
}
