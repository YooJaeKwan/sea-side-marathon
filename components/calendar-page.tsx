"use client"

import { ChevronLeft, ChevronRight, Flame, Timer, MapPin, TrendingUp } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

const DAYS_KR = ["일", "월", "화", "수", "목", "금", "토"]
const MONTHS_KR = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  unit: string
  color: string
}) {
  return (
    <div className="bg-card rounded-xl p-3 border border-border/50">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-3.5 h-3.5", color)} />
        <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-card-foreground">{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

interface MyStats {
  totalKm: number
  totalTime: string
  avgPace: string
  totalRuns: number
  streakDays: number
}

export function CalendarPage() {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [runDates, setRunDates] = useState<number[]>([])
  const [stats, setStats] = useState<MyStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [calRes, meRes] = await Promise.all([
        fetch(`/api/me/calendar?year=${currentYear}&month=${currentMonth + 1}`),
        fetch("/api/me"),
      ])
      if (calRes.ok) {
        const calData = await calRes.json()
        setRunDates(calData.runDates)
      }
      if (meRes.ok) {
        const meData = await meRes.json()
        setStats(meData.stats)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [currentYear, currentMonth])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === currentYear &&
    today.getMonth() === currentMonth &&
    today.getDate() === day

  const isRunDay = (day: number) => runDates.includes(day)

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={MapPin} label="누적 거리" value={stats?.totalKm ?? "-"} unit="km" color="text-accent" />
        <StatCard icon={Timer} label="누적 시간" value={stats?.totalTime ?? "-"} unit="시간" color="text-primary" />
        <StatCard icon={TrendingUp} label="평균 페이스" value={stats?.avgPace ?? "-"} unit="/km" color="text-card-foreground" />
        <StatCard icon={Flame} label="연속 인증" value={stats?.streakDays ?? 0} unit="일째" color="text-accent" />
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="이전 달">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h3 className="text-base font-bold text-card-foreground">
            {currentYear}년 {MONTHS_KR[currentMonth]}
          </h3>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="다음 달">
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS_KR.map((day) => (
            <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((i) => (
            <div key={`blank-${i}`} />
          ))}
          {days.map((day) => {
            const ran = isRunDay(day)
            const todayMark = isToday(day)
            return (
              <div key={day} className="flex items-center justify-center py-1">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    ran && "bg-primary text-primary-foreground shadow-sm shadow-primary/20",
                    !ran && "text-card-foreground",
                    todayMark && !ran && "ring-2 ring-primary/40",
                    todayMark && ran && "ring-2 ring-primary-foreground/50"
                  )}
                >
                  {day}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend + 인증 현황 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] text-muted-foreground">인증 완료</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full ring-2 ring-primary/40" />
              <span className="text-[10px] text-muted-foreground">오늘</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-primary">{runDates.length}</span>일 / {daysInMonth}일
          </p>
        </div>
      </div>
    </div>
  )
}
