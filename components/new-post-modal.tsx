"use client"

import { useState } from "react"
import { X, Camera, Clock, MapPin, MessageSquare, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface NewPostModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")
  const [distance, setDistance] = useState("")
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!minutes || !distance) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setHours("")
      setMinutes("")
      setDistance("")
      setComment("")
      onClose()
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <button onClick={onClose} className="text-muted-foreground p-1" aria-label="닫기">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-card-foreground">러닝 인증</h2>
          <div className="w-7" />
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-300">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <p className="text-base font-semibold text-card-foreground">인증 완료!</p>
            <p className="text-sm text-muted-foreground">오늘도 수고했어요</p>
            {/* Wave animation at bottom */}
            <div className="w-full mt-4 overflow-hidden">
              <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-[200%] h-6 animate-wave">
                <path d="M0,30 Q150,0 300,30 T600,30 T900,30 T1200,30 V60 H0 Z" fill="var(--primary)" opacity="0.2" />
                <path d="M0,35 Q150,10 300,35 T600,35 T900,35 T1200,35 V60 H0 Z" fill="var(--primary)" opacity="0.3" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-8 space-y-5">
            {/* Time input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground mb-2">
                <Clock className="w-4 h-4 text-primary" />
                뛴 시간 <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="00"
                    maxLength={2}
                    className="w-full h-12 bg-muted rounded-xl px-4 text-center text-lg font-bold text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">시간</span>
                </div>
                <span className="text-lg font-bold text-muted-foreground">:</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="00"
                    maxLength={2}
                    className="w-full h-12 bg-muted rounded-xl px-4 text-center text-lg font-bold text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">분</span>
                </div>
              </div>
            </div>

            {/* Distance input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground mb-2">
                <MapPin className="w-4 h-4 text-accent" />
                거리 <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="0.0"
                  className="w-full h-12 bg-muted rounded-xl px-4 text-center text-lg font-bold text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">km</span>
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground mb-2">
                <Camera className="w-4 h-4 text-muted-foreground" />
                사진 (선택)
              </label>
              <button className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Camera className="w-6 h-6" />
                <span className="text-xs">사진 추가하기</span>
              </button>
            </div>

            {/* Comment */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                한 마디 (선택)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="오늘 러닝은 어땠나요?"
                rows={2}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!minutes || !distance}
              className={cn(
                "w-full h-13 rounded-2xl text-base font-bold transition-all active:scale-[0.98]",
                minutes && distance
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              인증하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
