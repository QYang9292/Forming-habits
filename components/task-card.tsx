"use client"

import { Check, Trash2, Calendar, Tag, GripVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Task } from "@/app/page"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TaskCardProps {
  task: Task
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  draggable?: boolean
}

export default function TaskCard({ task, onToggle, onDelete, draggable = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !draggable,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatDueDate = (due?: string) => {
    if (!due) return null

    const dueDate = new Date(due)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}일 지남`, color: "text-red-600", bg: "bg-red-100" }
    } else if (diffDays === 0) {
      return { text: "오늘", color: "text-orange-600", bg: "bg-orange-100" }
    } else if (diffDays === 1) {
      return { text: "내일", color: "text-yellow-600", bg: "bg-yellow-100" }
    } else if (diffDays <= 7) {
      return { text: `${diffDays}일 후`, color: "text-blue-600", bg: "bg-blue-100" }
    } else {
      return { text: dueDate.toLocaleDateString("ko-KR"), color: "text-gray-600", bg: "bg-gray-100" }
    }
  }

  const dueInfo = formatDueDate(task.due)

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        task.completed ? "opacity-50" : "hover:shadow-md hover:scale-[1.02]"
      } ${isDragging ? "shadow-lg" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {draggable && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
              aria-label="드래그하여 이동"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h4
                className={`font-semibold text-sm leading-tight ${
                  task.completed ? "line-through text-gray-500" : "text-gray-900"
                }`}
              >
                {task.name}
              </h4>
            </div>

            {(task.description || task.note) && (
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  task.completed ? "line-through text-gray-400" : "text-gray-600"
                }`}
              >
                {task.note || task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Due date badge */}
              {dueInfo && (
                <Badge variant="secondary" className={`text-xs ${dueInfo.bg} ${dueInfo.color} border-0`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {dueInfo.text}
                </Badge>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1">
                  {task.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-2 w-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{task.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Priority indicators */}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    task.importance > 70 ? "bg-red-400" : task.importance > 40 ? "bg-yellow-400" : "bg-green-400"
                  }`}
                />
                <span>중요도 {task.importance}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    task.urgency > 70 ? "bg-red-400" : task.urgency > 40 ? "bg-yellow-400" : "bg-green-400"
                  }`}
                />
                <span>긴급도 {task.urgency}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(task.id)}
              className={`h-8 w-8 p-0 ${
                task.completed ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-green-600"
              }`}
              aria-label={task.completed ? "완료 취소" : "완료 표시"}
            >
              <Check className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                  aria-label="업무 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>업무를 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{task.name}" 업무가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(task.id)} className="bg-red-600 hover:bg-red-700">
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
