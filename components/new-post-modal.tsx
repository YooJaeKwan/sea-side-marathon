"use client"

import { useState, useRef } from "react"
import { X, Camera, Clock, MapPin, MessageSquare, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadImage } from "@/lib/supabase"

interface NewPostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: (newBadges?: any[]) => void
}

export function NewPostModal({ isOpen, onClose, onPostCreated }: NewPostModalProps) {
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")
  const [distance, setDistance] = useState("")
  const [comment, setComment] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!minutes || !distance || submitting) return
    setSubmitting(true)

    try {
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, "runs")
      }

      const h = parseInt(hours || "0")
      const m = parseInt(minutes)
      const duration = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      const dist = parseFloat(distance)
      const totalMin = h * 60 + m
      let pace = ""
      if (dist > 0 && totalMin > 0) {
        const p = totalMin / dist
        pace = `${Math.floor(p)}'${String(Math.round((p % 1) * 60)).padStart(2, "0")}"`
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration, distance: dist, pace, content: comment || null, imageUrl }),
      })

      if (res.ok) {
        const data = await res.json()
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setHours(""); setMinutes(""); setDistance(""); setComment("")
          setImageFile(null); setImagePreview(null)
          onPostCreated?.(data.newBadges)
        }, 1500)
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-border" /></div>
        <div className="flex items-center justify-between px-5 pb-4">
          <button onClick={onClose} className="text-muted-foreground p-1" aria-label="닫기"><X className="w-5 h-5" /></button>
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
          </div>
        ) : (
          <div className="px-5 pb-8 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground mb-2">
                <Clock className="w-4 h-4 text-primary" /> 뛴 시간 <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="00" maxLength={2} className="w-full h-12 bg-muted rounded-xl px-4 text-center text-lg font-bold text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">시간</span>
                </div>
                <span className="text-lg font-bold text-muted-foreground">:</span>
                <div className="relative flex-1">
                  <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="00" maxLength={2} className="w-full h-12 bg-muted rounded-xl px-4 text-center text-lg font-bold text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">분</span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground mb-2">
                <MapPin className="w-4 h-4 text-accent" /> 거리 <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="0.0" className="w-full h-12 bg-muted rounded-xl px-4 text-center text-lg font-bold text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">km</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground mb-2">
                <Camera className="w-4 h-4 text-muted-foreground" /> 사진 (선택)
              </label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                  <button onClick={() => { setImageFile(null); setImagePreview(null) }} className="absolute top-2 right-2 w-6 h-6 bg-foreground/60 text-background rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <Camera className="w-6 h-6" /><span className="text-xs">사진 추가하기</span>
                </button>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" /> 한 마디 (선택)
              </label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="오늘 러닝은 어땠나요?" rows={2} className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>

            <button onClick={handleSubmit} disabled={!minutes || !distance || submitting} className={cn("w-full h-13 rounded-2xl text-base font-bold transition-all active:scale-[0.98]", minutes && distance && !submitting ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground cursor-not-allowed")}>
              {submitting ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "인증하기"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
