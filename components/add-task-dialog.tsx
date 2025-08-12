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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
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
    note: "",
    due: "",
    important: false,
    urgent: false,
    tags: [] as string[],
  })

  const [newTag, setNewTag] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("업무 제목을 입력해주세요.")
      return
    }

    const taskData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      note: formData.note.trim() || undefined,
      due: formData.due || undefined,
      importance: formData.important ? 75 : 25,
      urgency: formData.urgent ? 75 : 25,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    }

    onAddTask(taskData)

    // Reset form
    setFormData({
      name: "",
      description: "",
      note: "",
      due: "",
      important: false,
      urgent: false,
      tags: [],
    })
    setNewTag("")
    onOpenChange(false)
  }

  const addTag = () => {
    const tag = newTag.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">새 업무 추가</DialogTitle>
          <DialogDescription>
            새로운 업무를 추가하고 우선순위를 설정하세요. 중요도와 긴급도에 따라 자동으로 매트릭스에 배치됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              업무 제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 프로젝트 보고서 작성"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              메모
            </Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="업무에 대한 간단한 메모를 입력하세요"
              rows={3}
              className="w-full resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due" className="text-sm font-medium">
              마감일
            </Label>
            <Input
              id="due"
              type="date"
              value={formData.due}
              onChange={(e) => setFormData({ ...formData, due: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">우선순위 설정</Label>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium text-sm">중요함</div>
                <div className="text-xs text-gray-500">장기적 목표와 관련된 업무</div>
              </div>
              <Switch
                checked={formData.important}
                onCheckedChange={(checked) => setFormData({ ...formData, important: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium text-sm">긴급함</div>
                <div className="text-xs text-gray-500">즉시 처리가 필요한 업무</div>
              </div>
              <Switch
                checked={formData.urgent}
                onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">태그</Label>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="태그 입력 후 Enter"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!newTag.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-2">배치될 사분면:</div>
            <div
              className={`text-sm px-3 py-1 rounded-full inline-block ${
                formData.important && formData.urgent
                  ? "bg-red-100 text-red-800"
                  : formData.important && !formData.urgent
                    ? "bg-blue-100 text-blue-800"
                    : !formData.important && formData.urgent
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {formData.important && formData.urgent && "긴급하고 중요"}
              {formData.important && !formData.urgent && "중요하지만 긴급하지 않음"}
              {!formData.important && formData.urgent && "긴급하지만 중요하지 않음"}
              {!formData.important && !formData.urgent && "긴급하지도 중요하지도 않음"}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              업무 추가
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
