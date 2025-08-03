"use client"
import { Check, Flame, Trash2, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import type { Routine } from "@/app/page"

interface RoutineCardProps {
  routine: Routine
  onToggle: (routineId: string, date: string) => void
  onDelete: (routineId: string) => void
}

export default function RoutineCard({ routine, onToggle, onDelete }: RoutineCardProps) {
  const today = new Date().toISOString().split("T")[0]
  const isCompletedToday = routine.completedDates.includes(today)

  // Calculate streak
  const calculateStreak = () => {
    const sortedDates = [...routine.completedDates].sort().reverse()
    let streak = 0
    const currentDate = new Date()

    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = currentDate.toISOString().split("T")[0]
      if (sortedDates.includes(dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()
  const completionRate = routine.targetDays > 0 ? (routine.completedDates.length / routine.targetDays) * 100 : 0

  return (
    <Card
      className={`transition-all duration-200 ${isCompletedToday ? "ring-2 ring-green-500 bg-green-50" : "hover:shadow-md"}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: routine.color }} />
            <div>
              <CardTitle className="text-lg">{routine.name}</CardTitle>
              {routine.description && <p className="text-sm text-gray-600 mt-1">{routine.description}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{routine.category}</Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>루틴을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. 모든 진행 기록이 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(routine.id)}>삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => onToggle(routine.id, today)}
            variant={isCompletedToday ? "default" : "outline"}
            className={`flex-1 mr-4 ${isCompletedToday ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            <Check className="h-4 w-4 mr-2" />
            {isCompletedToday ? "완료됨" : "완료하기"}
          </Button>

          {streak > 0 && (
            <div className="flex items-center space-x-1 text-orange-600">
              <Flame className="h-4 w-4" />
              <span className="font-semibold">{streak}일</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>진행률</span>
            <span>
              {routine.completedDates.length}/{routine.targetDays}일
            </span>
          </div>
          <Progress value={Math.min(completionRate, 100)} />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>총 {routine.completedDates.length}일 완료</span>
          </div>
          <span>{Math.round(completionRate)}% 달성</span>
        </div>
      </CardContent>
    </Card>
  )
}
