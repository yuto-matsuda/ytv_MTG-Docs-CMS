import { sizes } from "@/constants/sizes";
import type { Graph, GraphGroupWithProps, TabGroup } from "@/lib/types";
import { attachProps } from "@/lib/utils";
import { GripVertical, Settings } from "lucide-react";
import { useState } from "react";
import { DraggableGroupToolbar } from "./DraggableGroupToolBar";
import { TabContent } from "./tabs";

interface GraphProps {
  groupId: number
  index: number
}

export function GraphGrid({
  tab,
}: {
  tab: TabGroup
}) {
  const [groups, setGroups] = useState<GraphGroupWithProps[]>(attachProps(tab.groups));
  const maxGraphsPerGroup = Math.max(...groups.map((group) => group.graphs.length))

  const handleGroupReorder = (newGroups: GraphGroupWithProps[]) => {
    setGroups(newGroups)
  }

   const handleGraphReorder = (groupId: number, newGraphs: Graph[]) => {
    const newGroups = [...groups]
    newGroups[groupId].graphs = newGraphs;
    setGroups(newGroups);
  }

  const defaultSize = 'Small';
  const [size, setSize] = useState(sizes[defaultSize]);

  const handleSelectSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()
    setSize(sizes[e.target.value])
  }

  const [draggedGraph, setDraggedGraph] = useState<GraphProps | null>(null)
  const [dragOverGraph, setDragOverGraph] = useState<GraphProps | null>(null)

  const handleDragStart = (groupId: number, index: number) => {
    setDraggedGraph({ groupId, index })
  }

  const handleDragOver = (e: React.DragEvent, groupId: number, index: number) => {
    e.preventDefault()
    setDragOverGraph({ groupId, index })
  }

  const handleDrop = (e: React.DragEvent, dropGroupId: number, dropIndex: number) => {
    e.preventDefault()

    if (!draggedGraph || draggedGraph.groupId !== dropGroupId) {
      setDraggedGraph(null)
      setDragOverGraph(null)
      return
    }

    const groupGraphs = groups[dropGroupId].graphs;
    const newGraphs = [...groupGraphs]
    const [draggedItem] = newGraphs.splice(draggedGraph.index, 1)
    newGraphs.splice(dropIndex, 0, draggedItem)

    handleGraphReorder(dropGroupId, newGraphs)
    setDraggedGraph(null)
    setDragOverGraph(null)
  }

  const handleDragEnd = () => {
    setDraggedGraph(null)
    setDragOverGraph(null)
  }

  return (
    <TabContent className="inline-flex flex-col min-w-full">
      <div className="flex items-center gap-4 mb-2">
        <button
          popoverTarget={tab.name} style={{ anchorName: "--anchor-1" } as React.CSSProperties }
          className="flex items-center gap-1.5 bg-base-100 border border-base-content/20 cursor-pointer rounded-sm py-1.5 px-2 hover:bg-base-200"
        >
          <Settings size={12} />
          <span className="text-xs">表示設定</span>
        </button>
        <ul
          popover="auto" id={tab.name} style={{ positionAnchor: "--anchor-1" } as React.CSSProperties }
          className="dropdown menu w-52 rounded-box bg-base-100 shadow-lg mt-2"
        >
          <DraggableGroupToolbar groups={groups} onGroupReorder={handleGroupReorder} />
        </ul>
        <div className="space-x-1">
          <span className="text-xs">グラフサイズ :</span>
          <select className="select select-sm w-28 cursor-pointer" defaultValue={defaultSize} onChange={handleSelectSize}>
            {Object.entries(sizes).map(([key, _]) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        {Array.from({ length: maxGraphsPerGroup }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex">
            {groups.filter(group => group.visible).map((group, colIndex) => {
              const graph = group.graphs[rowIndex]
              const isDragging = draggedGraph?.groupId === colIndex && draggedGraph?.index === rowIndex
              const isDragOver = dragOverGraph?.groupId === colIndex && dragOverGraph?.groupId === draggedGraph?.groupId && dragOverGraph?.index === rowIndex && !isDragging
  
              return (
                <div
                  key={colIndex}
                  draggable={!!graph}
                  onDragStart={() => graph && handleDragStart(colIndex, rowIndex)}
                  onDragOver={(e) => handleDragOver(e, colIndex, rowIndex)}
                  onDrop={(e) => handleDrop(e, colIndex, rowIndex)}
                  onDragEnd={handleDragEnd}
                  className={`
                    shrink-0 p-4 rounded-md border-t-2
                    ${graph ? "cursor-grab active:cursor-grabbing" : ""}
                    transition-all
                    ${isDragging ? "opacity-50 scale-95" : ""}
                    ${isDragOver ? "bg-primary/10 border-t-primary" : "border-transparent"}
                    ${graph ? "hover:bg-base-200" : ""}
                  `}
                >
                  {graph && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4" />
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: group.color }} />
                        <span className="text-xs font-medium text-muted-foreground">
                          {group.name} - {graph.title}
                        </span>
                      </div>
                      {graph.src !== 'unknown' ? (
                        <img src={graph.src} className="w-full h-auto object-contain border border-neutral-content rounded-md" style={{ maxWidth: `${size}px` }} />
                      ) : (
                        <div className="flex items-center justify-center w-64 h-32 object-contain rounded-md border border-dashed border-secondary-20">No Image</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </TabContent>
  )
}
