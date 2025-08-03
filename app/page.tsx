"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Plus, Target, Calendar, TrendingUp, LogIn, LogOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RoutineCard from "@/components/routine-card"
import AddRoutineDialog from "@/components/add-routine-dialog"
import TaskMatrix from "@/components/task-matrix"
import AddTaskDialog from "@/components/add-task-dialog"
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

export interface Task {
  id: string
  name: string
  description: string
  importance: number
  urgency: number
  completed: boolean
  createdAt: string
}

const supabase = createClient("https://YOUR_PROJECT.supabase.co", "YOUR_PUBLIC_ANON_KEY")

export default function RoutineTracker() {
  const [user, setUser] = useState<any>(null)
  const [routines, setRoutines] = useState<Routine[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAddRoutineDialog, setShowAddRoutineDialog] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  useEffect(() => {
    if (!user) {
      const savedRoutines = localStorage.getItem("routines")
      if (savedRoutines) setRoutines(JSON.parse(savedRoutines))

      const savedTasks = localStorage.getItem("tasks")
      if (savedTasks) setTasks(JSON.parse(savedTasks))
    } else {
      // 로그인 상태일 경우 Supabase 연동 예정
    }
  }, [user])

  useEffect(() => {
    if (!user) localStorage.setItem("routines", JSON.stringify(routines))
  }, [routines])

  useEffect(() => {
    if (!user) localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" })
  }
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

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
      routines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              completedDates: routine.completedDates.includes(date)
                ? routine.completedDates.filter((d) => d !== date)
                : [...routine.completedDates, date],
            }
          : routine
      )
    )
  }

  const deleteRoutine = (routineId: string) => {
    setRoutines(routines.filter((routine) => routine.id !== routineId))
  }

  const addTask = (task: Omit<Task, "id" | "createdAt" | "completed">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
    }
    setTasks([...tasks, newTask])
  }

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const activeRoutines = routines.filter((routine) => routine.completedDates.length < routine.targetDays)
  const today = new Date().toISOString().split("T")[0]
  const todayCompletedCount = activeRoutines.filter((routine) => routine.completedDates.includes(today)).length
  const totalActiveRoutines = activeRoutines.length
  const completionRate = totalActiveRoutines > 0 ? (todayCompletedCount / totalActiveRoutines) * 100 : 0
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 로그인 버튼 */}
        <div className="flex justify-end mb-4">
          {user ? (
            <Button onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          ) : (
            <Button onClick={signInWithGoogle}>
              <LogIn className="mr-2 h-4 w-4" />
              Google 로그인
            </Button>
          )}
        </div>

        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">루틴 & 업무 관리</h1>
          <p className="text-gray-600">
            {user ? `${user.email}님 환영합니다` : "매일 조금씩, 더 나은 나를 만들어가세요"}
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘의 루틴</CardTitle>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 업무</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료한 업무</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 뷰 */}
        <Tabs defaultValue="routines" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="routines">루틴</TabsTrigger>
            <TabsTrigger value="tasks">업무</TabsTrigger>
            <TabsTrigger value="stats">통계</TabsTrigger>
          </TabsList>

          <TabsContent value="routines" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">오늘의 루틴</h2>
              <Button onClick={() => setShowAddRoutineDialog(true)}>
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
                  <Button onClick={() => setShowAddRoutineDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    첫 루틴 만들기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    onToggle={toggleRoutine}
                    onDelete={deleteRoutine}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks">
            <TaskMatrix
              tasks={tasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onAddTask={() => setShowAddTaskDialog(true)}
            />
          </TabsContent>

          <TabsContent value="stats">
            <StatsView routines={routines} />
          </TabsContent>
        </Tabs>

        <AddRoutineDialog
          open={showAddRoutineDialog}
          onOpenChange={setShowAddRoutineDialog}
          onAddRoutine={addRoutine}
        />

        <AddTaskDialog
          open={showAddTaskDialog}
          onOpenChange={setShowAddTaskDialog}
          onAddTask={addTask}
        />
      </div>
    </div>
  )
}
