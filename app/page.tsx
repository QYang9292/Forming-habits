"use client"

import { useState, useEffect } from "react"
import { Plus, Target, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function RoutineTracker() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAddRoutineDialog, setShowAddRoutineDialog] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)

  useEffect(() => {
    const savedRoutines = localStorage.getItem("routines")
    if (savedRoutines) {
      setRoutines(JSON.parse(savedRoutines))
    }

    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("routines", JSON.stringify(routines))
  }, [routines])

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  const addRoutine = (routine: Omit<Routine, "id" | "createdAt" | "completedDates">) => {
    const newRoutine: Routine = {
      ...routine,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedDates: [],
    }
    setRoutines([...routines, newRoutine])
  }

  const updateRoutine = (updatedRoutine: Routine) => {
    setRoutines(routines.map((routine) => (routine.id === updatedRoutine.id ? updatedRoutine : routine)))
    setEditingRoutine(null)
  }

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine)
    setShowAddRoutineDialog(true)
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
      tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed }
        }
        return task
      }),
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  // 루틴 통계 계산
  const activeRoutines = routines.filter((routine) => routine.completedDates.length < routine.targetDays)
  const completedRoutines = routines.filter((routine) => routine.completedDates.length >= routine.targetDays)

  const today = new Date().toISOString().split("T")[0]
  const todayCompletedRoutines = activeRoutines.filter((routine) => routine.completedDates.includes(today))

  // 업무 통계 계산
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  const totalActiveRoutines = activeRoutines.length
  const completionRate = totalActiveRoutines > 0 ? (todayCompletedRoutines.length / totalActiveRoutines) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">루틴 & 업무 관리</h1>
          <p className="text-gray-600">매일 조금씩, 더 나은 나를 만들어가세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘의 루틴</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {todayCompletedRoutines.length}/{totalActiveRoutines}
              </div>
              <p className="text-xs text-gray-600">완료율 {completionRate.toFixed(0)}%</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료한 루틴</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedRoutines.length}</div>
              <p className="text-xs text-gray-600">목표 달성한 루틴</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 업무</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{activeTasks.length}</div>
              <p className="text-xs text-gray-600">진행 중인 업무</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료한 업무</CardTitle>
              <AlertCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{completedTasks.length}</div>
              <p className="text-xs text-gray-600">완료된 업무</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
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
                    <Plus className="h-4 w-4 mr-2" />첫 루틴 만들기
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
                    onEdit={handleEditRoutine}
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
          onOpenChange={(open) => {
            setShowAddRoutineDialog(open)
            if (!open) {
              setEditingRoutine(null)
            }
          }}
          onAddRoutine={addRoutine}
          editingRoutine={editingRoutine}
          onUpdateRoutine={updateRoutine}
        />

        <AddTaskDialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog} onAddTask={addTask} />
      </div>
    </div>
  )
}
