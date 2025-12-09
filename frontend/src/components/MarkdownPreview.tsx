import { ConvertMarkdown } from "./ConvertMarkdown"

export function MarkdownPreview({
  title,
  date,
  content
}: {
  title: string
  date: string
  content: string
}) {
  return (
    <div className="h-full min-h-0 p-4 flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto"> 
        {(title && date) && (
          <div className="flex items-end gap-4 border-b border-base-content pb-0.5 mb-4">
            <h1 className="font-bold text-2xl px-2">{title}</h1>
            <p>{date.replaceAll('-', '.')}</p>
          </div>
        )}
        <div className="px-4">
          <ConvertMarkdown content={content} inEditor />
        </div>
      </div>
    </div>
  )
}
