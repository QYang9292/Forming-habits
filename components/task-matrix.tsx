"use client"

import { useState } from "react"
import { Plus, ArrowLeftRight, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TaskCard from "@/components/task-card"
import type { Task } from "@/app/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TaskMatrixProps {
  tasks: Task[]
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  onAddTask: () => void
}

export default function TaskMatrix({ tasks, onToggle, onDelete, onAddTask }: TaskMatrixProps) {
  const [sortOptions, setSortOptions] = useState({
    urgentImportant: "urgency-desc", // 긴급도 높은 순
    urgentNotImportant: "urgency-desc", // 긴급도 높은 순
    notUrgentImportant: "importance-desc", // 중요도 높은 순
    notUrgentNotImportant: "importance-desc", // 중요도 높은 순
  })

  const sortTasks = (tasks: Task[], sortBy: string) => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case "importance-desc":
          // 중요도 높은 순, 같으면 긴급도 높은 순
          if (b.importance !== a.importance) {
            return b.importance - a.importance
          }
          return b.urgency - a.urgency
        case "importance-asc":
          // 중요도 낮은 순, 같으면 긴급도 높은 순
          if (a.importance !== b.importance) {
            return a.importance - b.importance
          }
          return b.urgency - a.urgency
        case "urgency-desc":
          // 긴급도 높은 순, 같으면 중요도 높은 순
          if (b.urgency !== a.urgency) {
            return b.urgency - a.urgency
          }
          return b.importance - a.importance
        case "urgency-asc":
          // 긴급도 낮은 순, 같으면 중요도 높은 순
          if (a.urgency !== b.urgency) {
            return a.urgency - b.urgency
          }
          return b.importance - a.importance
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "created-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })
  }

  // Filter tasks into quadrants
  const getQuadrantTasks = (minImportance: number, maxImportance: number, minUrgency: number, maxUrgency: number) => {
    return tasks.filter(
      (task) =>
        !task.completed &&
        task.importance >= minImportance &&
        task.importance <= maxImportance &&
        task.urgency >= minUrgency &&
        task.urgency <= maxUrgency,
    )
  }

  const urgentImportant = getQuadrantTasks(51, 100, 51, 100) // 급하고 중요
  const urgentNotImportant = getQuadrantTasks(0, 50, 51, 100) // 급하지만 중요하지 않음
  const notUrgentImportant = getQuadrantTasks(51, 100, 0, 50) // 중요하지만 급하지 않음
  const notUrgentNotImportant = getQuadrantTasks(0, 50, 0, 50) // 급하지도 중요하지도 않음

  const sortedUrgentImportant = sortTasks(urgentImportant, sortOptions.urgentImportant)
  const sortedUrgentNotImportant = sortTasks(urgentNotImportant, sortOptions.urgentNotImportant)
  const sortedNotUrgentImportant = sortTasks(notUrgentImportant, sortOptions.notUrgentImportant)
  const sortedNotUrgentNotImportant = sortTasks(notUrgentNotImportant, sortOptions.notUrgentNotImportant)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">업무 매트릭스</h2>
        <Button onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          업무 추가
        </Button>
      </div>

      {/* Matrix Labels */}
      <div className="relative">
        {/* Top label - 급함 */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 text-sm font-medium text-gray-600">
          <ArrowUpDown className="h-4 w-4 transform rotate-0" />
          <span>급함</span>
        </div>

        {/* Left label - 중요 */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 flex items-center space-x-2 text-sm font-medium text-gray-600">
          <ArrowLeftRight className="h-4 w-4" />
          <span>중요</span>
        </div>

        {/* Right label - 덜 중요 */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 flex items-center space-x-2 text-sm font-medium text-gray-600">
          <span>덜 중요</span>
          <ArrowLeftRight className="h-4 w-4" />
        </div>

        {/* Bottom label - 덜 급함 */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 text-sm font-medium text-gray-600">
          <span>덜 급함</span>
          <ArrowUpDown className="h-4 w-4 transform rotate-0" />
        </div>

        {/* Matrix Grid - 위치 변경됨 */}
        <div className="grid grid-cols-2 gap-4 min-h-[600px]">
          {/* Quadrant 1: 급하고 중요 (Do First) - 왼쪽 위 */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-red-800">긴급하고 중요 ({urgentImportant.length})</CardTitle>
                  <p className="text-sm text-red-600">즉시 처리</p>
                </div>
                <Select
                  value={sortOptions.urgentImportant}
                  onValueChange={(value) => setSortOptions({ ...sortOptions, urgentImportant: value })}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgency-desc">긴급도 ↓</SelectItem>
                    <SelectItem value="importance-desc">중요도 ↓</SelectItem>
                    <SelectItem value="name-asc">이름순</SelectItem>
                    <SelectItem value="created-desc">최신순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedUrgentImportant.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
              ))}
              {urgentImportant.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">업무가 없습니다</p>
              )}
            </CardContent>
          </Card>

          {/* Quadrant 3: 급하지만 중요하지 않음 (Delegate) - 오른쪽 위 */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-yellow-800">
                    긴급하지만 중요하지 않음 ({urgentNotImportant.length})
                  </CardTitle>
                  <p className="text-sm text-yellow-600">위임하거나 빠르게 처리</p>
                </div>
                <Select
                  value={sortOptions.urgentNotImportant}
                  onValueChange={(value) => setSortOptions({ ...sortOptions, urgentNotImportant: value })}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgency-desc">긴급도 ↓</SelectItem>
                    <SelectItem value="importance-desc">중요도 ↓</SelectItem>
                    <SelectItem value="name-asc">이름순</SelectItem>
                    <SelectItem value="created-desc">최신순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedUrgentNotImportant.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
              ))}
              {urgentNotImportant.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">업무가 없습니다</p>
              )}
            </CardContent>
          </Card>

          {/* Quadrant 2: 중요하지만 급하지 않음 (Schedule) - 왼쪽 아래 */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-blue-800">
                    중요하지만 긴급하지 않음 ({notUrgentImportant.length})
                  </CardTitle>
                  <p className="text-sm text-blue-600">계획하여 처리</p>
                </div>
                <Select
                  value={sortOptions.notUrgentImportant}
                  onValueChange={(value) => setSortOptions({ ...sortOptions, notUrgentImportant: value })}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="importance-desc">중요도 ↓</SelectItem>
                    <SelectItem value="urgency-desc">긴급도 ↓</SelectItem>
                    <SelectItem value="name-asc">이름순</SelectItem>
                    <SelectItem value="created-desc">최신순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedNotUrgentImportant.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
              ))}
              {notUrgentImportant.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">업무가 없습니다</p>
              )}
            </CardContent>
          </Card>

          {/* Quadrant 4: 급하지도 중요하지도 않음 (Eliminate) - 오른쪽 아래 */}
          <Card className="border-gray-200 bg-gray-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-800">
                    긴급하지도 중요하지도 않음 ({notUrgentNotImportant.length})
                  </CardTitle>
                  <p className="text-sm text-gray-600">제거하거나 최소화</p>
                </div>
                <Select
                  value={sortOptions.notUrgentNotImportant}
                  onValueChange={(value) => setSortOptions({ ...sortOptions, notUrgentNotImportant: value })}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="importance-desc">중요도 ↓</SelectItem>
                    <SelectItem value="urgency-desc">긴급도 ↓</SelectItem>
                    <SelectItem value="name-asc">이름순</SelectItem>
                    <SelectItem value="created-desc">최신순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedNotUrgentNotImportant.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
              ))}
              {notUrgentNotImportant.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">업무가 없습니다</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
