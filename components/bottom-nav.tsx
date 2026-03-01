"use client"

import { Home, CalendarDays, Trophy, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onNewPost: () => void
}

const navItems = [
  { id: "feed", label: "피드", icon: Home },
  { id: "calendar", label: "내 기록", icon: CalendarDays },
  { id: "new", label: "인증", icon: Plus },
  { id: "ranking", label: "크루", icon: Trophy },
  { id: "profile", label: "프로필", icon: User },
]

export function BottomNav({ activeTab, onTabChange, onNewPost }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-bottom">
      <div className="mx-auto max-w-lg flex items-end justify-around px-2 pt-2 pb-2">
        {navItems.map((item) => {
          const isCenter = item.id === "new"
          const isActive = activeTab === item.id

          if (isCenter) {
            return (
              <button
                key={item.id}
                onClick={onNewPost}
                className="flex flex-col items-center -mt-5"
                aria-label="러닝 인증하기"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="text-[10px] mt-1 font-medium text-muted-foreground">{item.label}</span>
              </button>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
