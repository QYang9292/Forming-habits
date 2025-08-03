"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, Target, Award } from "lucide-react"
import type { Routine } from "@/app/page"

interface StatsViewProps {
  routines: Routine[]
}

export default function StatsView({ routines }: StatsViewProps) {
  const stats = useMemo(() => {
    const totalRoutines = routines.length
    const totalCompletions = routines.reduce((sum, routine) => sum + routine.completedDates.length, 0)

    // Calculate average completion rate
    const avgCompletionRate =
      totalRoutines > 0
        ? routines.reduce((sum, routine) => {
            const rate = routine.targetDays > 0 ? (routine.completedDates.length / routine.targetDays) * 100 : 0
            return sum + rate
          }, 0) / totalRoutines
        : 0

    // Find best performing routine
    const bestRoutine = routines.reduce(
      (best, routine) => {
        const rate = routine.targetDays > 0 ? (routine.completedDates.length / routine.targetDays) * 100 : 0
        const bestRate = best && best.targetDays > 0 ? (best.completedDates.length / best.targetDays) * 100 : 0
        return rate > bestRate ? routine : best
      },
      null as Routine | null,
    )

    // Calculate category stats
    const categoryStats = routines.reduce(
      (acc, routine) => {
        if (!acc[routine.category]) {
          acc[routine.category] = { count: 0, completions: 0 }
        }
        acc[routine.category].count++
        acc[routine.category].completions += routine.completedDates.length
        return acc
      },
      {} as Record<string, { count: number; completions: number }>,
    )

    // Calculate streak for each routine
    const calculateStreak = (routine: Routine) => {
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

    const longestStreak = routines.reduce((max, routine) => {
      const streak = calculateStreak(routine)
      return streak > max ? streak : max
    }, 0)

    return {
      totalRoutines,
      totalCompletions,
      avgCompletionRate,
      bestRoutine,
      categoryStats,
      longestStreak,
    }
  }, [routines])

  if (routines.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">통계가 없습니다</h3>
          <p className="text-gray-500">루틴을 추가하고 완료하면 통계를 확인할 수 있습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">통계</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 루틴 수</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoutines}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 완료 횟수</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompletions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 달성률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgCompletionRate)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최장 스트릭</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.longestStreak}일</div>
          </CardContent>
        </Card>
      </div>

      {/* Best Performing Routine */}
      {stats.bestRoutine && (
        <Card>
          <CardHeader>
            <CardTitle>최고 성과 루틴</CardTitle>
            <CardDescription>가장 높은 달성률을 보이는 루틴입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stats.bestRoutine.color }} />
                <span className="font-medium">{stats.bestRoutine.name}</span>
                <Badge variant="secondary">{stats.bestRoutine.category}</Badge>
              </div>
              <span className="text-sm font-medium">
                {Math.round((stats.bestRoutine.completedDates.length / stats.bestRoutine.targetDays) * 100)}%
              </span>
            </div>
            <Progress value={(stats.bestRoutine.completedDates.length / stats.bestRoutine.targetDays) * 100} />
            <p className="text-sm text-gray-600 mt-2">
              {stats.bestRoutine.completedDates.length}/{stats.bestRoutine.targetDays}일 완료
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 현황</CardTitle>
          <CardDescription>각 카테고리별 루틴 수와 완료 횟수입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.categoryStats).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{category}</Badge>
                  <span className="text-sm text-gray-600">{data.count}개 루틴</span>
                </div>
                <span className="font-medium">{data.completions}회 완료</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Routine Progress */}
      <Card>
        <CardHeader>
          <CardTitle>루틴별 진행률</CardTitle>
          <CardDescription>각 루틴의 상세 진행 상황입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routines.map((routine) => {
              const completionRate = (routine.completedDates.length / routine.targetDays) * 100
              return (
                <div key={routine.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: routine.color }} />
                      <span className="font-medium">{routine.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {routine.category}
                      </Badge>
                      {routine.completedDates.length >= routine.targetDays && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          완료
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm">
                      {routine.completedDates.length}/{routine.targetDays}일
                    </span>
                  </div>
                  <Progress value={Math.min(completionRate, 100)} />
                  <p className="text-xs text-gray-600">{Math.round(completionRate)}% 달성</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
