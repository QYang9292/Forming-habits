"use client"

import { useState, useEffect } from "react"
import { Plus, Target, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RoutineCard from "@/components/routine-card"
import AddRoutineDialog from "@/components/add-routine-dialog"
import StatsView from "@/components/stats-view"

export interface Routine {
  id: string
  name: string
  description: string
  category: string
  targetDays: number
  color: string
  createdAt: string
  completedDates: string[]
}

export default function RoutineTracker() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    const savedRoutines = localStorage.getItem("routines")
    if (savedRoutines) {
      setRoutines(JSON.parse(savedRoutines))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("routines", JSON.stringify(routines))
  }, [routines])

  const addRoutine = (routine: Omit<Routine, "id" | "createdAt" | "completedDates">) => {
    const newRoutine: Routine = {
      ...routine,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedDates: [],
    }
    setRoutines([...routines, newRoutine])
  }

  const toggleRoutine = (routineId: string, date: string) => {
    setRoutines(
      routines.map((routine) => {
        if (routine.id === routineId) {
          const completedDates = routine.completedDates.includes(date)
            ? routine.completedDates.filter((d) => d !== date)
            : [...routine.completedDates, date]
          return { ...routine, completedDates }
        }
        return routine
      }),
    )
  }

  const deleteRoutine = (routineId: string) => {
    setRoutines(routines.filter((routine) => routine.id !== routineId))
  }

  // 완료되지 않은 루틴만 필터링
  const activeRoutines = routines.filter((routine) => routine.completedDates.length < routine.targetDays)

  const today = new Date().toISOString().split("T")[0]
  const todayCompletedCount = activeRoutines.filter((routine) => routine.completedDates.includes(today)).length

  const totalActiveRoutines = activeRoutines.length
  const completionRate = totalActiveRoutines > 0 ? (todayCompletedCount / totalActiveRoutines) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">루틴 형성 헬퍼</h1>
          <p className="text-gray-600">매일 조금씩, 더 나은 나를 만들어가세요</p>
        </div>

        {/* Today's Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘의 진행률</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료한 루틴</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayCompletedCount}/{totalActiveRoutines}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalActiveRoutines > 0 ? "좋은 하루네요!" : "첫 루틴을 추가해보세요"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 루틴 수</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActiveRoutines}</div>
              <p className="text-xs text-muted-foreground mt-1">꾸준함이 힘입니다</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="routines" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="routines">내 루틴</TabsTrigger>
            <TabsTrigger value="stats">통계</TabsTrigger>
          </TabsList>

          <TabsContent value="routines" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">오늘의 루틴</h2>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                루틴 추가
              </Button>
            </div>

            {activeRoutines.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">아직 루틴이 없습니다</h3>
                  <p className="text-gray-500 mb-4">첫 번째 루틴을 추가하고 성장을 시작해보세요!</p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />첫 루틴 만들기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeRoutines.map((routine) => (
                  <RoutineCard key={routine.id} routine={routine} onToggle={toggleRoutine} onDelete={deleteRoutine} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats">
            <StatsView routines={routines} />
          </TabsContent>
        </Tabs>

        <AddRoutineDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAddRoutine={addRoutine} />
      </div>
    </div>
  )
}
