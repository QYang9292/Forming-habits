"use client";

import { useEffect, useState } from "react";
import { Plus, Target, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoutineCard from "@/components/routine-card";
import AddRoutineDialog from "@/components/add-routine-dialog";
import TaskMatrix from "@/components/task-matrix";
import AddTaskDialog from "@/components/add-task-dialog";
import StatsView from "@/components/stats-view";
import { supabaseBrowser } from "@/lib/supabase/client";

/* ---------- 타입(최상위에 위치해야 함) ---------- */
export interface Routine {
  id: string;
  name: string;
  description: string;
  category: string;
  targetDays: number;
  color: string;
  createdAt: string;
  completedDates: string[];
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  note?: string;
  due?: string;
  importance: number;
  urgency: number;
  completed: boolean;
  createdAt: string;
  tags?: string[];
}

/* ---------- 페이지(클라이언트 컴포넌트) ---------- */
export default function Home() {
  // 로그인 상태 (클라이언트에서만 확인)
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    const supabase = supabaseBrowser();
    // 최초 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
    // 로그인/로그아웃 실시간 반영
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const isLoggedIn = !!userEmail;

  // 앱 상태
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddRoutineDialog, setShowAddRoutineDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // 초기 로드 (게스트: localStorage 사용)
  useEffect(() => {
    const savedRoutines = localStorage.getItem("routines");
    if (savedRoutines) setRoutines(JSON.parse(savedRoutines));

    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const sampleTasks: Task[] = [
        {
          id: "1",
          name: "프로젝트 보고서 작성",
          note: "월말 보고서 준비",
          due: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          importance: 80,
          urgency: 70,
          completed: false,
          createdAt: new Date().toISOString(),
          tags: ["업무", "보고서"],
        },
        {
          id: "2",
          name: "팀 미팅 준비",
          note: "주간 회의 자료 준비",
          importance: 60,
          urgency: 80,
          completed: false,
          createdAt: new Date().toISOString(),
          tags: ["미팅"],
        },
        {
          id: "3",
          name: "새로운 기술 학습",
          note: "React 18 새 기능 공부",
          importance: 70,
          urgency: 30,
          completed: false,
          createdAt: new Date().toISOString(),
          tags: ["학습", "개발"],
        },
      ];
      setTasks(sampleTasks);
      localStorage.setItem("tasks", JSON.stringify(sampleTasks));
    }
  }, []);

  // 로컬 저장
  useEffect(() => {
    localStorage.setItem("routines", JSON.stringify(routines));
  }, [routines]);
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // 루틴 CRUD
  const addRoutine = (routine: Omit<Routine, "id" | "createdAt" | "completedDates">) => {
    const newRoutine: Routine = {
      ...routine,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedDates: [],
    };
    setRoutines([...routines, newRoutine]);
  };
  const updateRoutine = (updated: Routine) => {
    setRoutines(routines.map((r) => (r.id === updated.id ? updated : r)));
    setEditingRoutine(null);
  };
  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine);
    setShowAddRoutineDialog(true);
  };
  const toggleRoutine = (routineId: string, date: string) => {
    setRoutines(
      routines.map((r) => {
        if (r.id === routineId) {
          const completedDates = r.completedDates.includes(date)
            ? r.completedDates.filter((d) => d !== date)
            : [...r.completedDates, date];
          return { ...r, completedDates };
        }
        return r;
      }),
    );
  };
  const deleteRoutine = (routineId: string) => {
    setRoutines(routines.filter((r) => r.id !== routineId));
  };

  // 업무 CRUD
  const addTask = (task: Omit<Task, "id" | "createdAt" | "completed">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setTasks([...tasks, newTask]);
  };
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
  };
  const toggleTask = (taskId: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  // 통계
  const activeRoutines = routines.filter((r) => r.completedDates.length < r.targetDays);
  const completedRoutines = routines.filter((r) => r.completedDates.length >= r.targetDays);
  const today = new Date().toISOString().split("T")[0];
  const todayCompletedRoutines = activeRoutines.filter((r) => r.completedDates.includes(today));
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const totalActiveRoutines = activeRoutines.length;
  const completionRate = totalActiveRoutines > 0 ? (todayCompletedRoutines.length / totalActiveRoutines) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 게스트/로그인 안내 배너 */}
        <div className="mb-4 rounded-md border bg-white/90 p-3 text-sm">
          {isLoggedIn ? (
            <>
              <span className="font-medium">로그인됨</span> ({userEmail}) · 현재{" "}
              <span className="font-medium">로컬 저장</span> 사용 중
              <span className="ml-2 opacity-70">— 추후 클라우드 동기화 붙일 수 있어요.</span>
            </>
          ) : (
            <>
              지금은 <span className="font-medium">게스트 모드</span>입니다. 데이터는{" "}
              <span className="font-medium">이 브라우저에만</span> 저장돼요.{" "}
              <a href="/login" className="underline">로그인</a>하면 클라우드 저장/동기화 가능.
            </>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">루틴 & 업무 관리</h1>
          <p className="text-gray-600">매일 조금씩, 더 나은 나를 만들어가세요</p>
        </div>

        {/* 상단 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘의 루틴</CardTitle>
              <Target className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {todayCompletedRoutines.length}/{totalActiveRoutines}
              </div>
              <p className="text-xs text-gray-600">완료율 {completionRate.toFixed(0)}%</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료한 루틴</CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{completedRoutines.length}</div>
              <p className="text-xs text-gray-600">목표 달성한 루틴</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 업무</CardTitle>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{activeTasks.length}</div>
              <p className="text-xs text-gray-600">진행 중인 업무</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료한 업무</CardTitle>
              <AlertCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{completedTasks.length}</div>
              <p className="text-xs text-gray-600">완료된 업무</p>
            </CardContent>
          </Card>
        </div>

        {/* 메인 콘텐츠 */}
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
              onUpdateTask={updateTask}
            />
          </TabsContent>

          <TabsContent value="stats">
            <StatsView routines={routines} />
          </TabsContent>
        </Tabs>

        <AddRoutineDialog
          open={showAddRoutineDialog}
          onOpenChange={(open) => {
            setShowAddRoutineDialog(open);
            if (!open) setEditingRoutine(null);
          }}
          onAddRoutine={addRoutine}
          editingRoutine={editingRoutine}
          onUpdateRoutine={updateRoutine}
        />

        <AddTaskDialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog} onAddTask={addTask} />
      </div>
    </div>
  );
}
