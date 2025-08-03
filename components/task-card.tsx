"use client"

import { Check, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

interface TaskCardProps {
  task: Task
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <Card className={`transition-all duration-200 ${task.completed ? "opacity-50" : "hover:shadow-sm"}`}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between space-x-2">
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-sm ${task.completed ? "line-through text-gray-500" : ""}`}>{task.name}</h4>
            {task.description && (
              <p className={`text-xs mt-1 ${task.completed ? "line-through text-gray-400" : "text-gray-600"}`}>
                {task.description}
              </p>
            )}
            <div className="flex space-x-2 mt-2 text-xs text-gray-500">
              <span>중요도: {task.importance}%</span>
              <span>긴급도: {task.urgency}%</span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(task.id)}
              className={`h-6 w-6 p-0 ${task.completed ? "text-green-600" : "text-gray-400 hover:text-green-600"}`}
            >
              <Check className="h-3 w-3" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-600">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>업무를 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(task.id)}>삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
