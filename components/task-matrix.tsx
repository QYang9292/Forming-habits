"use client"

import { useState } from "react"
import { Plus, ArrowLeftRight, ArrowUpDown, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TaskCard from "@/components/task-card"
import type { Task } from "@/app/page"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"

interface TaskMatrixProps {
  tasks: Task[]
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  onAddTask: () => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
}

export default function TaskMatrix({ tasks, onToggle, onDelete, onAddTask, onUpdateTask }: TaskMatrixProps) {
  const [sortBy, setSortBy] = useState<"due" | "importance" | "urgency" | "created">("due")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "due":
          const aDate = a.due ? new Date(a.due).getTime() : Number.POSITIVE_INFINITY
          const bDate = b.due ? new Date(b.due).getTime() : Number.POSITIVE_INFINITY
          comparison = aDate - bDate
          break
        case "importance":
          comparison = b.importance - a.importance
          break
        case "urgency":
          comparison = b.urgency - a.urgency
          break
        case "created":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })
  }

  const getQuadrantTasks = (important: boolean, urgent: boolean) => {
    return tasks.filter((task) => {
      if (task.completed) return false

      const isImportant = task.importance > 50
      const isUrgent = task.urgency > 50

      return isImportant === important && isUrgent === urgent
    })
  }

  const urgentImportant = sortTasks(getQuadrantTasks(true, true))
  const notUrgentImportant = sortTasks(getQuadrantTasks(true, false))
  const urgentNotImportant = sortTasks(getQuadrantTasks(false, true))
  const notUrgentNotImportant = sortTasks(getQuadrantTasks(false, false))

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const taskId = active.id as string
    const quadrant = over.id as string

    let importance = 25
    let urgency = 25

    switch (quadrant) {
      case "urgent-important":
        importance = 75
        urgency = 75
        break
      case "not-urgent-important":
        importance = 75
        urgency = 25
        break
      case "urgent-not-important":
        importance = 25
        urgency = 75
        break
      case "not-urgent-not-important":
        importance = 25
        urgency = 25
        break
    }

    onUpdateTask(taskId, { importance, urgency })
  }

  const QuadrantCard = ({
    id,
    title,
    subtitle,
    tasks,
    bgColor,
    borderColor,
    textColor,
  }: {
    id: string
    title: string
    subtitle: string
    tasks: Task[]
    bgColor: string
    borderColor: string
    textColor: string
  }) => (
    <Card className={`${borderColor} ${bgColor} transition-all duration-200 hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`text-lg ${textColor} font-semibold`}>
              {title} ({tasks.length})
            </CardTitle>
            <p className={`text-sm ${textColor.replace("800", "600")}`}>{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 min-h-[200px]" id={id}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} draggable />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Calendar className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">업무가 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">여기로 업무를 드래그하세요</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">업무 매트릭스</h2>
          <p className="text-gray-600 mt-1">아이젠하워 매트릭스로 업무 우선순위를 관리하세요</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due">마감일순</SelectItem>
              <SelectItem value="importance">중요도순</SelectItem>
              <SelectItem value="urgency">긴급도순</SelectItem>
              <SelectItem value="created">생성일순</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>

          <Button onClick={onAddTask} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            업무 추가
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <div className="relative">
          {/* Axis Labels */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 text-sm font-medium text-gray-600">
            <ArrowUpDown className="h-4 w-4" />
            <span>긴급함</span>
          </div>

          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 -rotate-90 flex items-center space-x-2 text-sm font-medium text-gray-600">
            <ArrowLeftRight className="h-4 w-4" />
            <span>중요함</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuadrantCard
              id="urgent-important"
              title="긴급하고 중요"
              subtitle="즉시 처리하세요"
              tasks={urgentImportant}
              bgColor="bg-red-50"
              borderColor="border-red-200"
              textColor="text-red-800"
            />

            <QuadrantCard
              id="urgent-not-important"
              title="긴급하지만 중요하지 않음"
              subtitle="위임하거나 빠르게 처리하세요"
              tasks={urgentNotImportant}
              bgColor="bg-yellow-50"
              borderColor="border-yellow-200"
              textColor="text-yellow-800"
            />

            <QuadrantCard
              id="not-urgent-important"
              title="중요하지만 긴급하지 않음"
              subtitle="계획을 세워 처리하세요"
              tasks={notUrgentImportant}
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
              textColor="text-blue-800"
            />

            <QuadrantCard
              id="not-urgent-not-important"
              title="긴급하지도 중요하지도 않음"
              subtitle="제거하거나 최소화하세요"
              tasks={notUrgentNotImportant}
              bgColor="bg-gray-50"
              borderColor="border-gray-200"
              textColor="text-gray-800"
            />
          </div>
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onToggle={onToggle} onDelete={onDelete} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
