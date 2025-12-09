import useModal from "@/hooks/useModal"
import type { OutletContextType } from "@/layouts/DashboardLayout"
import { convertDate, getImageName, textCopy } from "@/lib/utils"
import { Image, Save } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { useOutletContext } from "react-router"
import Split from "react-split"
import { MarkdownEditor } from "./MarkdonwEditor"
import { MarkdownPreview } from "./MarkdownPreview"
import { Modal } from "./Modal"

export default function DocumentForm({
  heading,
  title,
  date,
  body,
  titleError,
  dateError,
  isProcessing,
  handleSubmit,
  handleTitleChange,
  handleDateChange,
  handleBodyChange,
}: {
  heading: string
  title: string
  date: Date | undefined
  body: string
  titleError: boolean
  dateError: boolean
  isProcessing: boolean
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>
  handleTitleChange: (newTitle: string) => void
  handleDateChange: (newDate: Date | undefined) => void
  handleBodyChange: (newBody: string) => void
}) {
  const { images } = useOutletContext<OutletContextType>();
  const [isOpen, openModal, closeModal] = useModal();

  const handleClickImage = (path: string) => {
    textCopy(getImageName(path));
    closeModal();
  }

  return (
    <div className="flex flex-col max-w-7xl h-[calc(100vh-64px)] mx-auto px-4 pb-8">
      <h1 className="text-xl font-bold mb-4">{heading}</h1>
      {(titleError || dateError) && (
        <p className="text-error mb-2">タイトルとミーティング日は必須項目です</p>
      )}
      <div className="flex flex-col flex-1 min-h-0">  
        <div className="flex items-center justify-between gap-4 w-full mb-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm font-bold">タイトル:</span>
              <input
                type="text"
                value={title}
                placeholder="Title" 
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`w-72 text-sm border-2 border-base-content/50 outline-none rounded-md py-1 px-2 focus:border-primary`}
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm font-bold">ミーティング日:</span>
              <button
                type="button"
                popoverTarget="rdp-popover"
                style={{ anchorName: "--rdp" } as React.CSSProperties}
                className={`
                  w-28 text-sm border-2 border-base-content/50 outline-none rounded-md py-1 px-2 focus:border-primary
                  ${date ? "text-black" : "text-base-content/50"}
                `}
              >
                {date ? convertDate(date).replaceAll('-', '.') : "Meeting Date"}
              </button>
              <div popover="auto" id="rdp-popover" className="dropdown" style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
                <DayPicker className="react-day-picker" mode="single" selected={date} onSelect={handleDateChange} />
              </div>
            </label>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => openModal('image-list')} className="flex items-center gap-2 text-white font-bold bg-info rounded-md cursor-pointer py-1 px-2 hover:bg-info/80">
              <Image size={16} />
              <span className="text-sm">画像</span>
            </button>
            <button
              onClick={(e) => handleSubmit(e)}
              disabled={isProcessing}
              className={`
                flex items-center gap-2 text-white font-bold rounded-md py-1 px-2
                ${isProcessing ? "disabled:bg-success/50 cursor-not-allowed" : "bg-success hover:bg-success/70 cursor-pointer"}
              `}
            >
              <Save size={16} />
              <span className="text-sm">保存</span>
            </button>
          </div>
        </div>
        <Split
          className="flex  h-full min-h-0 border-2 border-base-content/50"
          gutter={() => {
            const gutterElement = document.createElement("div");
            gutterElement.className = `w-[3px] bg-gray-400 hover:cursor-col-resize hover:bg-secondary/30 transition-all duration-300`;
            return gutterElement;
          }}
          gutterStyle={() => ({})}  // デフォルトのガター幅を無効化
          sizes={[50, 50]}
        >
          <MarkdownEditor content={body} onChange={handleBodyChange} />  
          <MarkdownPreview title={title} date={convertDate(date)} content={body} />
        </Split>
      </div>
      <Modal isOpen={isOpen('image-list')} bgClose={closeModal} className="max-w-4xl w-9/12 h-4/5 bg-base-100 rounded-lg p-8">
        <div className="grid grid-cols-5 gap-2">
          {images.map(img => (
            <div key={img.id} onClick={() => handleClickImage(img.path)} className="relative h-40 group">
              <div className="w-full h-full overflow-hidden rounded-lg cursor-pointer border border-base-content">
                <img
                  src={img.url}
                  className="w-full h-full object-cover group-hover:scale-110 transform transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-0 left-0 rounded-lg flex flex-col justify-between w-full cursor-pointer p-1">
                <p className="w-full text-white text-xs text-center text-ellipsis whitespace-nowrap overflow-hidden bg-black/40 rounded p-1">{getImageName(img.path)}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>    
  )
}