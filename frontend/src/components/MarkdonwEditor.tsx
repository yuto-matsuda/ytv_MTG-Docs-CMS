interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newContent = content.substring(0, start) + "  " + content.substring(end)
      onChange(newContent)
    }
  }

  return (
    <div className="h-full bg-base-200 p-4">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-full w-full overflow-auto resize-none bg-transparent font-mono text-sm text-base-content outline-none placeholder:text-base-content/50"
        placeholder="Markdownでドキュメントを記述..."
        spellCheck={false}
      />
    </div>
  )
}
