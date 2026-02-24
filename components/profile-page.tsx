"use client"

import { Settings, LogOut, MapPin, Timer, TrendingUp, CalendarCheck, ChevronRight, Waves } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { mockMyStats, mockBadges } from "@/lib/mock-data"

export function ProfilePage() {
  const earnedBadges = mockBadges.filter((b) => b.earned)

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="bg-primary h-20 relative">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,40 Q100,0 200,40 T400,40 V80 H0 Z" fill="white" />
              <path d="M0,50 Q100,10 200,50 T400,50 V80 H0 Z" fill="white" opacity="0.5" />
            </svg>
          </div>
        </div>
        <div className="px-4 pb-4 -mt-8 relative z-10">
          <Avatar className="w-16 h-16 ring-4 ring-card">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              HC
            </AvatarFallback>
          </Avatar>
          <div className="mt-2">
            <h2 className="text-lg font-bold text-card-foreground">김해찬</h2>
            <p className="text-xs text-muted-foreground">Sea Side Pacer 크루</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border/50 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">누적 거리</span>
          </div>
          <p className="text-xl font-bold text-card-foreground">{mockMyStats.totalKm}<span className="text-xs font-normal text-muted-foreground ml-1">km</span></p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Timer className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">누적 시간</span>
          </div>
          <p className="text-xl font-bold text-card-foreground">14:35<span className="text-xs font-normal text-muted-foreground ml-1">시간</span></p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-card-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">평균 페이스</span>
          </div>
          <p className="text-xl font-bold text-card-foreground">{mockMyStats.avgPace}<span className="text-xs font-normal text-muted-foreground ml-1">/km</span></p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">총 인증</span>
          </div>
          <p className="text-xl font-bold text-card-foreground">{mockMyStats.totalRuns}<span className="text-xs font-normal text-muted-foreground ml-1">일</span></p>
        </div>
      </div>

      {/* Earned badges preview */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-card-foreground">획득한 배지</h3>
          </div>
          <span className="text-xs text-primary font-medium">{earnedBadges.length}개</span>
        </div>
        <div className="flex gap-3">
          {earnedBadges.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                <Waves className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[9px] text-muted-foreground text-center leading-tight">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <button className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border/30 text-left">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-sm text-card-foreground">설정</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
          <LogOut className="w-4 h-4 text-destructive" />
          <span className="flex-1 text-sm text-destructive">로그아웃</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
