"use client"

import { Crown, Medal, Award, Waves } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { mockRanking, mockBadges } from "@/lib/mock-data"
import { useState } from "react"

const rankIcons = [
  { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-50", ring: "ring-yellow-300" },
  { icon: Medal, color: "text-gray-400", bg: "bg-gray-50", ring: "ring-gray-300" },
  { icon: Award, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-300" },
]

const badgeIcons: Record<string, { emoji: string; color: string }> = {
  "wave-first": { emoji: "~", color: "bg-primary/15 text-primary" },
  "wave-streak": { emoji: "~", color: "bg-primary/15 text-primary" },
  "turtle": { emoji: "T", color: "bg-green-100 text-green-700" },
  "dolphin": { emoji: "D", color: "bg-blue-100 text-blue-700" },
  "current": { emoji: "C", color: "bg-cyan-100 text-cyan-700" },
  "shell": { emoji: "S", color: "bg-amber-100 text-amber-700" },
}

export function RankingPage() {
  const [activeTab, setActiveTab] = useState<"ranking" | "badges">("ranking")

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex bg-card rounded-xl border border-border/50 p-1">
        <button
          onClick={() => setActiveTab("ranking")}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
            activeTab === "ranking"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          랭킹
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
            activeTab === "badges"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          배지
        </button>
      </div>

      {activeTab === "ranking" ? (
        <>
          {/* Top 3 Podium */}
          <div className="bg-card rounded-2xl border border-border/50 p-4 pt-6">
            <div className="flex items-end justify-center gap-3">
              {/* 2nd place */}
              <div className="flex flex-col items-center w-24">
                <Avatar className={cn("w-14 h-14 ring-2", rankIcons[1].ring)}>
                  <AvatarFallback className={cn("text-sm font-bold", rankIcons[1].bg, rankIcons[1].color)}>
                    {mockRanking[1].initials}
                  </AvatarFallback>
                </Avatar>
                <Medal className="w-5 h-5 text-gray-400 mt-1" />
                <p className="text-xs font-bold text-card-foreground mt-1">{mockRanking[1].name}</p>
                <p className="text-[10px] text-muted-foreground">{mockRanking[1].certDays}일</p>
                <div className="w-full h-16 bg-gray-100 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-400">2</span>
                </div>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center w-24">
                <Avatar className={cn("w-16 h-16 ring-2", rankIcons[0].ring)}>
                  <AvatarFallback className={cn("text-base font-bold", rankIcons[0].bg, rankIcons[0].color)}>
                    {mockRanking[0].initials}
                  </AvatarFallback>
                </Avatar>
                <Crown className="w-6 h-6 text-yellow-500 mt-1" />
                <p className="text-xs font-bold text-card-foreground mt-1">{mockRanking[0].name}</p>
                <p className="text-[10px] text-muted-foreground">{mockRanking[0].certDays}일</p>
                <div className="w-full h-24 bg-primary/10 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center w-24">
                <Avatar className={cn("w-14 h-14 ring-2", rankIcons[2].ring)}>
                  <AvatarFallback className={cn("text-sm font-bold", rankIcons[2].bg, rankIcons[2].color)}>
                    {mockRanking[2].initials}
                  </AvatarFallback>
                </Avatar>
                <Award className="w-5 h-5 text-amber-600 mt-1" />
                <p className="text-xs font-bold text-card-foreground mt-1">{mockRanking[2].name}</p>
                <p className="text-[10px] text-muted-foreground">{mockRanking[2].certDays}일</p>
                <div className="w-full h-12 bg-amber-50 rounded-t-lg mt-2 flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-600">3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full ranking list */}
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h3 className="text-sm font-bold text-card-foreground">2월 인증일 랭킹</h3>
            </div>
            <div className="divide-y divide-border/30">
              {mockRanking.map((user) => (
                <div key={user.rank} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                      user.rank === 1 && "bg-yellow-50 text-yellow-600",
                      user.rank === 2 && "bg-gray-100 text-gray-500",
                      user.rank === 3 && "bg-amber-50 text-amber-600",
                      user.rank > 3 && "bg-muted text-muted-foreground"
                    )}
                  >
                    {user.rank}
                  </span>
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user.totalKm} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{user.certDays}일</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Badges section */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Waves className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-card-foreground">내 배지</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {mockBadges.filter((b) => b.earned).length}/{mockBadges.length}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {mockBadges.map((badge) => {
                const iconConfig = badgeIcons[badge.icon] || { emoji: "?", color: "bg-muted text-muted-foreground" }
                return (
                  <div
                    key={badge.id}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                      badge.earned
                        ? "bg-primary/5 border border-primary/20"
                        : "bg-muted/50 opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold",
                        badge.earned ? iconConfig.color : "bg-muted text-muted-foreground",
                        badge.earned && "animate-float"
                      )}
                    >
                      {badge.icon === "wave-first" && (
                        <Waves className="w-6 h-6" />
                      )}
                      {badge.icon === "wave-streak" && (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
                          <path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
                          <path d="M2 7c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
                        </svg>
                      )}
                      {badge.icon === "turtle" && (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <ellipse cx="12" cy="13" rx="8" ry="5" />
                          <circle cx="12" cy="13" r="3" />
                          <path d="M19 13c1-1 2-1 3 0" />
                          <path d="M2 13c1-1 2-1 3 0" />
                          <path d="M12 8V6" />
                        </svg>
                      )}
                      {badge.icon === "dolphin" && (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 18c3-6 8-12 15-12-3 2-4 5-4 8 2-1 5-3 7-6-2 6-8 10-14 10-2 0-3-1-4 0" />
                        </svg>
                      )}
                      {badge.icon === "current" && (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6c3-2 5 0 8-2s5 0 8-2 3 2 6 0" />
                          <path d="M2 12c3-2 5 0 8-2s5 0 8-2 3 2 6 0" />
                          <path d="M2 18c3-2 5 0 8-2s5 0 8-2 3 2 6 0" />
                        </svg>
                      )}
                      {badge.icon === "shell" && (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 3c-4 0-8 4-8 9s6 9 8 9 8-4 8-9-4-9-8-9z" />
                          <path d="M12 3c-2 3-3 6-3 9s1 6 3 9" />
                          <path d="M12 3c2 3 3 6 3 9s-1 6-3 9" />
                        </svg>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-card-foreground leading-tight">{badge.name}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
                    </div>
                    {badge.earned && badge.earnedDate && (
                      <span className="text-[9px] text-primary font-medium">획득</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
