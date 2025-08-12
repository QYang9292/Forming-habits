"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Routine } from "@/app/page"

interface AddRoutineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddRoutine: (routine: Omit<Routine, "id" | "createdAt" | "completedDates">) => void
  editingRoutine?: Routine | null
  onUpdateRoutine?: (routine: Routine) => void
}

const categories = ["건강", "운동", "학습", "독서", "명상", "취미", "업무", "기타"]

const colors = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
]

export default function AddRoutineDialog({
  open,
  onOpenChange,
  onAddRoutine,
  editingRoutine,
  onUpdateRoutine,
}: AddRoutineDialogProps) {
  const [formData, setFormData] = useState({
    name: editingRoutine?.name || "",
    description: editingRoutine?.description || "",
    category: editingRoutine?.category || "",
    targetDays: editingRoutine?.targetDays || 30,
    color: editingRoutine?.color || colors[0],
  })

  useEffect(() => {
    if (editingRoutine) {
      setFormData({
        name: editingRoutine.name,
        description: editingRoutine.description,
        category: editingRoutine.category,
        targetDays: editingRoutine.targetDays,
        color: editingRoutine.color,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        targetDays: 30,
        color: colors[0],
      })
    }
  }, [editingRoutine])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("루틴 이름을 입력해주세요.")
      return
    }

    if (editingRoutine && onUpdateRoutine) {
      onUpdateRoutine({
        ...editingRoutine,
        ...formData,
      })
    } else {
      onAddRoutine(formData)
    }

    setFormData({
      name: "",
      description: "",
      category: "",
      targetDays: 30,
      color: colors[0],
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingRoutine ? "루틴 수정" : "새 루틴 추가"}</DialogTitle>
          <DialogDescription>
            {editingRoutine ? "루틴 정보를 수정하세요." : "새로운 루틴을 만들어 목표를 달성해보세요."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">루틴 이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 매일 30분 운동하기"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="루틴에 대한 간단한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요 (선택사항)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDays">목표 일수</Label>
            <Input
              id="targetDays"
              type="number"
              min="1"
              max="365"
              value={formData.targetDays}
              onChange={(e) => setFormData({ ...formData, targetDays: Number.parseInt(e.target.value) || 30 })}
            />
          </div>

          <div className="space-y-2">
            <Label>색상</Label>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? "border-gray-900" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">{editingRoutine ? "수정" : "루틴 추가"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
