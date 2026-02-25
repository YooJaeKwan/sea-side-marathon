"use client"

import { Settings, LogOut, MapPin, Timer, TrendingUp, CalendarCheck, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"

interface UserProfile {
  name: string
  email: string
  image: string | null
  initials: string | null
  category: string | null
  stats: { totalKm: number; totalTime: string; avgPace: string; totalRuns: number; streakDays: number }
}

export function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(d => { if (d) setProfile(d) }).finally(() => setLoading(false))
  }, [])

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
            {profile?.image && <AvatarImage src={profile.image} alt={profile?.name || "프로필"} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-card-foreground">{profile?.name || session?.user?.name || "사용자"}</h2>
              {profile?.category && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-bold",
                  profile.category === "10km" ? "bg-red-100 text-red-600" :
                    profile.category === "5km" ? "bg-blue-100 text-blue-600" :
                      "bg-orange-100 text-orange-600"
                )}>
                  {profile.category}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Sea Side Crew</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBox icon={MapPin} label="누적 거리" value={`${stats?.totalKm ?? 0}`} unit="km" iconBg="bg-accent/10" iconColor="text-accent" />
        <StatBox icon={Timer} label="누적 시간" value={stats?.totalTime ?? "00:00"} unit="시간" iconBg="bg-primary/10" iconColor="text-primary" />
        <StatBox icon={TrendingUp} label="평균 페이스" value={stats?.avgPace ?? "-"} unit="/km" iconBg="bg-secondary" iconColor="text-card-foreground" />
        <StatBox icon={CalendarCheck} label="총 인증" value={`${stats?.totalRuns ?? 0}`} unit="일" iconBg="bg-primary/10" iconColor="text-primary" />
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

function StatBox({ icon: Icon, label, value, unit, iconBg, iconColor }: { icon: React.ElementType; label: string; value: string; unit: string; iconBg: string; iconColor: string }) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${iconColor}`} /></div>
        <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-card-foreground">{value}<span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span></p>
    </div>
  )
}
