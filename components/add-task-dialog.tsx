"use client"

import type React from "react"
import { useState } from "react"
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
import { Slider } from "@/components/ui/slider"
import type { Task } from "@/app/page"

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => void
}

export default function AddTaskDialog({ open, onOpenChange, onAddTask }: AddTaskDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    importance: 50,
    urgency: 50,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("업무 이름을 입력해주세요.")
      return
    }

    onAddTask(formData)
    setFormData({
      name: "",
      description: "",
      importance: 50,
      urgency: 50,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 업무 추가</DialogTitle>
          <DialogDescription>새로운 업무를 추가하고 중요도와 긴급도를 설정하세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">업무 이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 프로젝트 보고서 작성"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="업무에 대한 간단한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>중요도: {formData.importance}%</Label>
            <Slider
              value={[formData.importance]}
              onValueChange={(value) => setFormData({ ...formData, importance: value[0] })}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>덜 중요</span>
              <span>매우 중요</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>긴급도: {formData.urgency}%</Label>
            <Slider
              value={[formData.urgency]}
              onValueChange={(value) => setFormData({ ...formData, urgency: value[0] })}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>덜 급함</span>
              <span>매우 급함</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">업무 추가</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
