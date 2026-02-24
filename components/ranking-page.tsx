"use client"

import { Crown, Medal, Award, Waves } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const rankIcons = [
  { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-50", ring: "ring-yellow-300" },
  { icon: Medal, color: "text-gray-400", bg: "bg-gray-50", ring: "ring-gray-300" },
  { icon: Award, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-300" },
]

interface RankingUser {
  rank: number
  name: string
  initials: string
  avatar: string
  certDays: number
  totalKm: number
}

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate: string | null
}

export function RankingPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<"ranking" | "badges">("ranking")
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (status !== "authenticated") return

      setLoading(true)
      setError(false)
      try {
        if (activeTab === "ranking") {
          const res = await fetch("/api/ranking")
          if (res.ok) setRanking(await res.json())
          else setError(true)
        } else {
          const res = await fetch("/api/badges")
          if (res.ok) setBadges(await res.json())
          else setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [activeTab, status])

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

      {loading || status === "loading" ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-card rounded-2xl border border-border/50 p-8 text-center text-muted-foreground">
          <p className="text-sm">데이터를 불러오지 못했습니다.</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-xs text-primary font-bold">다시 시도</button>
        </div>
      ) : activeTab === "ranking" ? (
        <>
          {ranking.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
              <Crown className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-card-foreground">아직 랭킹 데이터가 없어요</p>
              <p className="text-xs text-muted-foreground mt-1">이번 달 첫 인증을 해보세요!</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {ranking.length >= 3 && (
                <div className="bg-card rounded-2xl border border-border/50 p-4 pt-6">
                  <div className="flex items-end justify-center gap-3">
                    {/* 2nd place */}
                    <div className="flex flex-col items-center w-24">
                      <Avatar className={cn("w-14 h-14 ring-2", rankIcons[1].ring)}>
                        {ranking[1].avatar && <AvatarImage src={ranking[1].avatar} alt={ranking[1].name} />}
                        <AvatarFallback className={cn("text-sm font-bold", rankIcons[1].bg, rankIcons[1].color)}>
                          {ranking[1].initials}
                        </AvatarFallback>
                      </Avatar>
                      <Medal className="w-5 h-5 text-gray-400 mt-1" />
                      <p className="text-xs font-bold text-card-foreground mt-1">{ranking[1].name}</p>
                      <p className="text-[10px] text-muted-foreground">{ranking[1].certDays}일</p>
                      <div className="w-full h-16 bg-gray-100 rounded-t-lg mt-2 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-400">2</span>
                      </div>
                    </div>

                    {/* 1st place */}
                    <div className="flex flex-col items-center w-24">
                      <Avatar className={cn("w-16 h-16 ring-2", rankIcons[0].ring)}>
                        {ranking[0].avatar && <AvatarImage src={ranking[0].avatar} alt={ranking[0].name} />}
                        <AvatarFallback className={cn("text-base font-bold", rankIcons[0].bg, rankIcons[0].color)}>
                          {ranking[0].initials}
                        </AvatarFallback>
                      </Avatar>
                      <Crown className="w-6 h-6 text-yellow-500 mt-1" />
                      <p className="text-xs font-bold text-card-foreground mt-1">{ranking[0].name}</p>
                      <p className="text-[10px] text-muted-foreground">{ranking[0].certDays}일</p>
                      <div className="w-full h-24 bg-primary/10 rounded-t-lg mt-2 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">1</span>
                      </div>
                    </div>

                    {/* 3rd place */}
                    <div className="flex flex-col items-center w-24">
                      <Avatar className={cn("w-14 h-14 ring-2", rankIcons[2].ring)}>
                        {ranking[2].avatar && <AvatarImage src={ranking[2].avatar} alt={ranking[2].name} />}
                        <AvatarFallback className={cn("text-sm font-bold", rankIcons[2].bg, rankIcons[2].color)}>
                          {ranking[2].initials}
                        </AvatarFallback>
                      </Avatar>
                      <Award className="w-5 h-5 text-amber-600 mt-1" />
                      <p className="text-xs font-bold text-card-foreground mt-1">{ranking[2].name}</p>
                      <p className="text-[10px] text-muted-foreground">{ranking[2].certDays}일</p>
                      <div className="w-full h-12 bg-amber-50 rounded-t-lg mt-2 flex items-center justify-center">
                        <span className="text-xl font-bold text-amber-600">3</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full ranking list */}
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-bold text-card-foreground">이번 달 인증일 랭킹</h3>
                </div>
                <div className="divide-y divide-border/30">
                  {ranking.map((user) => (
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
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
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
          )}
        </>
      ) : (
        <>
          {/* Badges section */}
          {badges.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
              <Waves className="w-8 h-8 text-primary/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-card-foreground">배지가 아직 없어요</p>
              <p className="text-xs text-muted-foreground mt-1">관리자가 배지를 추가하면 여기에 표시됩니다</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Waves className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-card-foreground">내 배지</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {badges.filter((b) => b.earned).length}/{badges.length}
                </span>
              </div>

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
            </div>
          )}
        </>
      )}
    </div>
  )
}
