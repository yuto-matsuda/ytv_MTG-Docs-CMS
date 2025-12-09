import type { GraphGroupWithProps } from "@/lib/types"
import { GripVertical } from "lucide-react"
import { useState } from "react"

type DraggableGroupToolbarProps = {
  groups: GraphGroupWithProps[]
  onGroupReorder: (newGroups: GraphGroupWithProps[]) => void
}

export function DraggableGroupToolbar({ groups, onGroupReorder }: DraggableGroupToolbarProps) {
  const [clickedIndex, setClickedIndex] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const onClick = (index: number) => {
    const newGroups = [...groups]
    newGroups[index].visible = !newGroups[index].visible;
    onGroupReorder(newGroups)
    setClickedIndex(index === clickedIndex ? null : index)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null) return

    const newGroups = [...groups]
    const [draggedGroup] = newGroups.splice(draggedIndex, 1)
    newGroups.splice(dropIndex, 0, draggedGroup)

    onGroupReorder(newGroups)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="bg-base-100 rounded-lg overflow-hidden p-4">
      <div className="overflow-x-auto">
        <div className="flex flex-col min-w-max gap-2">
          {groups.map((group, index) => (
            <div
              key={index}
              draggable
              onClick={() => onClick(index)}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                flex items-center gap-1 pl-1 pr-2 py-1 rounded-md cursor-grab active:cursor-grabbing
                border border-base-content/50 transition-all
                ${!group.visible ? "bg-black/10" : "hover:bg-base-200"}
                ${draggedIndex === index ? "opacity-50 scale-95" : ""}
                ${dragOverIndex === index && draggedIndex !== index ? "bg-primary/20 border-primary" : ""}
              `}
            >
              <GripVertical size={14} />
              <div className="h-3 w-3 rounded-full mr-1" style={{ backgroundColor: group.color }} />
              <span className="text-xs font-medium">{group.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
