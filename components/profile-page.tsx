"use client"

import { LogOut, ChevronRight, Edit2, Check, X, Award } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"

interface UserProfile {
  name: string
  realName: string | null
  email: string
  image: string | null
  initials: string | null
  category: string | null
  stats: { totalKm: number; totalTime: string; avgPace: string; totalRuns: number; streakDays: number }
}

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate: string | null
}

export function ProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [loading, setLoading] = useState(true)

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then(r => r.ok ? r.json() : null),
      fetch("/api/badges").then(r => r.ok ? r.json() : [])
    ]).then(([profileData, badgesData]) => {
      if (profileData) setProfile(profileData)
      if (badgesData) setBadges(badgesData)
    }).finally(() => setLoading(false))
  }, [])

  const handleSaveNickname = async () => {
    const newName = editName.trim()
    if (!newName || newName.length < 2) {
      alert("닉네임은 2글자 이상 입력해주세요.")
      return
    }

    setSaving(true)
    try {
      const newInitials = newName.slice(0, 2).toUpperCase()
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, initials: newInitials }),
      })
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, name: newName, initials: newInitials } : null)
        await update({ name: newName, picture: profile?.image }) // Update NextAuth session
        setIsEditing(false)
      } else {
        alert("닉네임 변경에 실패했습니다.")
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const initials = profile?.initials || profile?.name?.slice(0, 2).toUpperCase() || "?"
  const stats = profile?.stats

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="bg-primary h-20 relative">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,40 Q100,0 200,40 T400,40 V80 H0 Z" fill="white" />
            </svg>
          </div>
        </div>
        <div className="px-4 pb-4 -mt-8 relative z-10">
          <Avatar className="w-16 h-16 ring-4 ring-card">
            {profile?.image && <AvatarImage src={profile.image} alt={profile?.name || "프로필"} referrerPolicy="no-referrer" />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="mt-2 min-h-[50px]">
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveNickname()}
                  maxLength={20}
                  className="h-8 px-2 text-sm border font-bold text-card-foreground border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary w-40"
                  autoFocus
                  disabled={saving}
                />
                <button
                  onClick={handleSaveNickname}
                  disabled={saving || !editName.trim() || editName.trim().length < 2}
                  className="p-1.5 bg-primary/10 text-primary rounded-md disabled:opacity-50 hover:bg-primary/20 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="p-1.5 bg-muted text-muted-foreground rounded-md disabled:opacity-50 hover:bg-muted/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-card-foreground">{profile?.name || session?.user?.name || "사용자"}</h2>
                <button
                  onClick={() => {
                    setEditName(profile?.name || session?.user?.name || "")
                    setIsEditing(true)
                  }}
                  className="p-1 text-muted-foreground hover:text-primary transition-colors rounded-md"
                  title="닉네임 수정"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {profile?.category && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold ml-1",
                    profile.category === "10km" ? "bg-red-100 text-red-600" :
                      profile.category === "5km" ? "bg-blue-100 text-blue-600" :
                        "bg-orange-100 text-orange-600"
                  )}>
                    {profile.category}
                  </span>
                )}
              </div>
            )}

            {profile?.realName && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ocean/50 inline-block"></span>
                본명: {profile.realName}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Sea Side Crew</p>
          </div>
        </div>
      </div>



      {/* Badges section */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-card-foreground">내 배지</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {badges.filter((b) => b.earned).length}/{badges.length}
          </span>
        </div>

        {badges.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">배지가 아직 없어요</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge) => {
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    badge.earned
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/30 border-transparent opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm",
                      badge.earned ? "bg-white ring-2 ring-primary/20" : "bg-muted/50 grayscale"
                    )}
                  >
                    {badge.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-card-foreground leading-tight">{badge.name}</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">{badge.description}</p>
                  </div>
                  {badge.earned && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">획득</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {/* <button className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border/30 text-left">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-sm text-card-foreground">설정</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button> */}
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer">
          <LogOut className="w-4 h-4 text-destructive" />
          <span className="flex-1 text-sm text-destructive">로그아웃</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}

