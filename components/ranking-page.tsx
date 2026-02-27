"use client"

import { Crown, Medal, Award, ChevronLeft, ChevronRight } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState<"ranking" | "awards">("ranking")

  // New State Format
  const [rankingData, setRankingData] = useState<{
    attendance: any[]
    challenge: any[]
    completion: any[]
    cheer: any[]
    random: any[]
  } | null>(null)

  // Month Selection State
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const currentYear = kstNow.getUTCFullYear()
  const currentMonth = kstNow.getUTCMonth() + 1

  const [displayYear, setDisplayYear] = useState(currentYear)
  const [displayMonth, setDisplayMonth] = useState(currentMonth)

  const handlePrevMonth = () => {
    if (displayMonth === 1) {
      setDisplayMonth(12)
      setDisplayYear(prev => prev - 1)
    } else {
      setDisplayMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (displayYear === currentYear && displayMonth === currentMonth) return
    if (displayMonth === 12) {
      setDisplayMonth(1)
      setDisplayYear(prev => prev + 1)
    } else {
      setDisplayMonth(prev => prev + 1)
    }
  }

  const isCurrentMonth = displayYear === currentYear && displayMonth === currentMonth

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (status !== "authenticated") return

      setLoading(true)
      setError(false)
      try {
        if (activeTab === "ranking") {
          const res = await fetch(`/api/ranking?year=${displayYear}&month=${displayMonth}`)
          if (res.ok) setRankingData(await res.json())
          else setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [activeTab, status, displayYear, displayMonth])

  const renderRankingPodiumAndList = (title: string, data: any[], emptyMsg: string, isCheer = false) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
          <Crown className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-card-foreground">{emptyMsg}</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-card-foreground px-1 flex items-center gap-2">
          {isCheer ? <Award className="w-5 h-5 text-primary" /> : <Crown className="w-5 h-5 text-yellow-500" />}
          {title}
        </h3>

        {/* Top 3 Podium */}
        {data.length >= 3 && (
          <div className="bg-card rounded-2xl border border-border/50 p-4 pt-6">
            <div className="flex items-end justify-center gap-3">
              {/* 2nd place */}
              <div className="flex flex-col items-center w-24">
                <Avatar className={cn("w-14 h-14 ring-2 border-2 border-white", rankIcons[1].ring)}>
                  {data[1].avatar && <AvatarImage src={data[1].avatar} alt={data[1].name} referrerPolicy="no-referrer" />}
                  <AvatarFallback className={cn("text-sm font-bold", rankIcons[1].bg, rankIcons[1].color)}>
                    {data[1].initials}
                  </AvatarFallback>
                </Avatar>
                <Medal className="w-5 h-5 text-gray-400 mt-1" />
                <p className="text-xs font-bold text-card-foreground mt-1 truncate w-full text-center">{data[1].name}</p>
                <p className="text-[10px] text-muted-foreground text-center font-medium bg-white/50 px-1.5 rounded">{data[1].value}</p>
                {data[1].subValue && <p className="text-[8px] text-muted-foreground/80 mt-0.5 truncate max-w-[80px] text-center">{data[1].subValue.split('·')[0].trim()}</p>}
                {data[1].subValue && <p className="text-[8px] text-muted-foreground/80 truncate max-w-[80px] text-center">{data[1].subValue.split('·')[1].trim()}</p>}
                <div className="w-full h-16 bg-gray-100 rounded-t-lg mt-2 flex items-center justify-center border-t border-x border-gray-200">
                  <span className="text-xl font-bold text-gray-400">2</span>
                </div>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center w-24">
                <Avatar className={cn("w-16 h-16 ring-2 border-2 border-white", rankIcons[0].ring)}>
                  {data[0].avatar && <AvatarImage src={data[0].avatar} alt={data[0].name} referrerPolicy="no-referrer" />}
                  <AvatarFallback className={cn("text-base font-bold", rankIcons[0].bg, rankIcons[0].color)}>
                    {data[0].initials}
                  </AvatarFallback>
                </Avatar>
                <Crown className="w-6 h-6 text-yellow-500 mt-1" />
                <p className="text-xs font-bold text-card-foreground mt-1 truncate w-full text-center">{data[0].name}</p>
                <p className="text-[11px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-full">{data[0].value}</p>
                {data[0].subValue && <p className="text-[9px] text-muted-foreground/90 mt-1 truncate max-w-[90px] text-center">{data[0].subValue.split('·')[0].trim()}</p>}
                {data[0].subValue && <p className="text-[9px] text-muted-foreground/90 truncate max-w-[90px] text-center">{data[0].subValue.split('·')[1].trim()}</p>}
                <div className="w-full h-24 bg-primary/10 rounded-t-lg mt-2 flex items-center justify-center border-t border-x border-primary/20 shadow-inner">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center w-24">
                <Avatar className={cn("w-14 h-14 ring-2 border-2 border-white", rankIcons[2].ring)}>
                  {data[2].avatar && <AvatarImage src={data[2].avatar} alt={data[2].name} referrerPolicy="no-referrer" />}
                  <AvatarFallback className={cn("text-sm font-bold", rankIcons[2].bg, rankIcons[2].color)}>
                    {data[2].initials}
                  </AvatarFallback>
                </Avatar>
                <Award className="w-5 h-5 text-amber-600 mt-1" />
                <p className="text-xs font-bold text-card-foreground mt-1 truncate w-full text-center">{data[2].name}</p>
                <p className="text-[10px] text-muted-foreground text-center font-medium bg-white/50 px-1.5 rounded">{data[2].value}</p>
                {data[2].subValue && <p className="text-[8px] text-muted-foreground/80 mt-0.5 truncate max-w-[80px] text-center">{data[2].subValue.split('·')[0].trim()}</p>}
                {data[2].subValue && <p className="text-[8px] text-muted-foreground/80 truncate max-w-[80px] text-center">{data[2].subValue.split('·')[1].trim()}</p>}
                <div className="w-full h-12 bg-amber-50 rounded-t-lg mt-2 flex items-center justify-center border-t border-x border-amber-100">
                  <span className="text-xl font-bold text-amber-600">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full list */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="divide-y divide-border/30">
            {data.map((user) => (
              <div key={user.rank} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    user.rank === 1 && "bg-yellow-50 text-yellow-600",
                    user.rank === 2 && "bg-gray-100 text-gray-500",
                    user.rank === 3 && "bg-amber-50 text-amber-600",
                    user.rank > 3 && "bg-muted text-muted-foreground"
                  )}
                >
                  {user.rank}
                </span>
                <Avatar className="w-9 h-9 border border-white ring-1 ring-primary/10 shadow-sm shrink-0">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-semibold text-card-foreground truncate">{user.name}</p>
                  {user.subValue && <p className="text-[10px] text-muted-foreground truncate">{user.subValue}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{user.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderChallengeList = (title: string, data: any[], emptyMsg: string, subtitle: string) => {
    return (
      <div className="space-y-3">
        <div className="px-1">
          <h3 className="text-base font-bold text-card-foreground flex items-center gap-2">
            <Medal className="w-5 h-5 text-primary" />
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>

        {(!data || data.length === 0) ? (
          <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">{emptyMsg}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {data.map((user, i) => (
              <div key={user.id || i} className="bg-card rounded-2xl border border-border/50 p-3 flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-white ring-1 ring-primary/10 shadow-sm shrink-0">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />}
                  <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-card-foreground truncate">{user.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.conditions?.map((cond: string, idx: number) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 pb-1 text-center">
              <p className="text-xs text-primary font-semibold">총 {data.length}명의 후보가 있습니다 🎉</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCandidateGrid = (title: string, data: any[], emptyMsg: string, subtitle: string) => {
    return (
      <div className="space-y-3">
        <div className="px-1">
          <h3 className="text-base font-bold text-card-foreground flex items-center gap-2">
            <Medal className="w-5 h-5 text-primary" />
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>

        {(!data || data.length === 0) ? (
          <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">{emptyMsg}</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {data.map((user, i) => (
                <div key={user.id || i} className="flex flex-col items-center gap-1.5">
                  <Avatar className="w-12 h-12 border-2 border-white ring-2 ring-primary/10 shadow-sm">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />}
                    <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-[10px] font-bold text-card-foreground truncate w-full text-center">{user.name}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-center">
              <p className="text-xs text-primary font-semibold">총 {data.length}명의 후보가 있습니다 🎉</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
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
          이달의 현황
        </button>
        <button
          onClick={() => setActiveTab("awards")}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
            activeTab === "awards"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          시상기준
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
      ) : activeTab === "ranking" && rankingData ? (
        <div className="space-y-10">
          {/* Month Navigator */}
          <div className="flex items-center justify-between bg-card rounded-2xl border border-border/50 p-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <span className="text-[10px] font-semibold text-muted-foreground block">{displayYear}년</span>
              <h2 className="text-lg font-bold text-card-foreground">{displayMonth}월 랭킹</h2>
            </div>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className={cn(
                "p-2 rounded-full transition-colors",
                isCurrentMonth ? "text-muted-foreground opacity-30 cursor-not-allowed" : "hover:bg-muted text-muted-foreground"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {renderRankingPodiumAndList(
            "출석상 랭킹",
            rankingData.attendance,
            "아직 출석 기록이 없습니다."
          )}

          {renderChallengeList(
            "도전상 후보",
            rankingData.challenge,
            "아직 도전상 조건을 달성한 분이 없습니다.",
            "첫 5km 완주, 누적 20km, 주 2회 3주 유지, 30분 달리기 첫 성공"
          )}

          {renderCandidateGrid(
            "완주상 후보",
            rankingData.completion,
            "아직 5km 이상 완주하신 분이 없습니다.",
            "한 달에 한 번이라도 5km를 완주하신 분 대상 추첨"
          )}

          {renderRankingPodiumAndList(
            "응원상 랭킹",
            rankingData.cheer,
            "아직 응원 댓글 활동 기록이 없습니다.",
            true
          )}

          {renderCandidateGrid(
            "랜덤상 후보",
            rankingData.random,
            "아직 이번 달 인증자가 없습니다.",
            "최소 1회 이상 운동을 인증하신 모든 분 대상 추첨"
          )}
        </div>
      ) : activeTab === "awards" ? (
        <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
          {/* ... existing awards criteria static UI ... */}
          <div className="text-center pb-4 border-b border-border/50">
            <h2 className="text-lg font-bold text-card-foreground mb-1">🏅 시상 기준 안내</h2>
            <p className="text-left text-xs text-muted-foreground">
              * 인증 기준 <br />- 2km 이상 또는 20분 이상 걷기, 달리기 기록 사진 인증<br /><br />모든 기록은 앱 인증 기준으로 확인하며, 각 부문은 중복 수상 없이 진행됩니다.
            </p>
          </div>

          <div className="space-y-5">
            {/* 1. 출석상 */}
            <div>
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                <span>1️⃣</span> 출석상
              </h3>
              <p className="text-xs font-bold text-card-foreground mb-1.5 flex items-center gap-1">
                <span className="text-[10px]">👉🏻</span> 가장 꾸준히 참여한 분
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 marker:text-primary/30">
                <li>한 달 동안 인증 횟수가 가장 많은 분 선정</li>
                <li>동률일 경우, 총 운동 시간 합산으로 결정</li>
              </ul>
            </div>

            {/* 2. 도전상 */}
            <div>
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                <span>2️⃣</span> 도전상
              </h3>
              <p className="text-xs font-bold text-card-foreground mb-1.5 flex items-center gap-1">
                <span className="text-[10px]">👉🏻</span> 이번 달, 스스로 한 단계 성장한 분
              </p>
              <p className="text-xs text-muted-foreground mb-1.5">아래 항목 중 1개 이상 달성 시 후보가 됩니다!</p>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 marker:text-primary/30">
                <li>5km 첫 완주</li>
                <li>누적 20km 달성</li>
                <li>주 2회 이상 걷기,달리기를 3주 이상 유지</li>
                <li>30분 연속 달리기 첫 성공</li>
              </ul>
              <p className="text-[10px] text-primary mt-1.5 italic">* 위 조건 달성자 중 추첨으로 선정</p>
            </div>

            {/* 3. 완주상 */}
            <div>
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                <span>3️⃣</span> 완주상
              </h3>
              <p className="text-xs font-bold text-card-foreground mb-1.5 flex items-center gap-1">
                <span className="text-[10px]">👉🏻</span> 마라톤 완주를 응원합니다 🏃‍♂️
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 marker:text-primary/30">
                <li>한 달 동안 5km 이상 1회 이상 인증 시 후보</li>
              </ul>
              <p className="text-[10px] text-primary mt-1.5 italic">* 후보 중 무작위 추첨</p>
            </div>

            {/* 4. 응원상 */}
            <div>
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                <span>4️⃣</span> 응원상
              </h3>
              <p className="text-xs font-bold text-card-foreground mb-1.5 flex items-center gap-1">
                <span className="text-[10px]">👉🏻</span> 공동체 분위기를 살려준 분
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 marker:text-primary/30">
                <li>댓글 및 응원 활동이 활발한 분</li>
                <li>단순 하트 수가 아닌, 다양한 사람에게 응원을 나눈 분을 우선 고려</li>
              </ul>
            </div>

            {/* 5. 랜덤상 */}
            <div>
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                <span>5️⃣</span> 랜덤상
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 marker:text-primary/30">
                <li>최소 1회 이상 걷기,달리기 인증 시 자동 후보</li>
              </ul>
              <p className="text-[10px] text-primary mt-1.5 italic">* 후보 중 무작위 추첨</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
