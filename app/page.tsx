"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { FeedPage } from "@/components/feed-page"
import { CalendarPage } from "@/components/calendar-page"
import { RankingPage } from "@/components/ranking-page"
import { ProfilePage } from "@/components/profile-page"
import { NewPostModal } from "@/components/new-post-modal"

const TAB_TITLES: Record<string, string> = {
  feed: "피드",
  calendar: "내 기록",
  ranking: "랭킹",
  profile: "프로필",
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("feed")
  const [showNewPost, setShowNewPost] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dday, setDday] = useState(0)

  useEffect(() => {
    const target = new Date("2026-05-16T00:00:00+09:00")
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    setDday(diff > 0 ? diff : 0)
  }, [])

  // Redirect to signup if not onboarded
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/me")
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data && data.isOnboarded === false) {
            router.push("/signup")
          }
        })
    }
  }, [status, router])

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts")
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts()
    }
  }, [status, fetchPosts])

  const handlePostCreated = () => {
    setShowNewPost(false)
    fetchPosts()
  }

  if (status === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background max-w-lg mx-auto relative">
      {/* D-Day Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,50 Q100,0 200,50 T400,50 V100 H0 Z" fill="currentColor" />
            <path d="M0,60 Q100,20 200,60 T400,60 V100 H0 Z" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-3">
          <div>
            <p className="text-[10px] font-medium opacity-70">Sea Side Marathon</p>
            <p className="text-xl font-bold">D-{dday}</p>
            <p className="text-[10px] opacity-60">2026.05.16 영종도</p>
          </div>
          <span className="text-xs font-semibold bg-white/15 rounded-full px-3 py-1">{TAB_TITLES[activeTab]}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 pt-4 pb-28">
        {activeTab === "feed" && <FeedPage posts={posts} loading={loading} onRefresh={fetchPosts} />}
        {activeTab === "calendar" && <CalendarPage />}
        {activeTab === "ranking" && <RankingPage />}
        {activeTab === "profile" && <ProfilePage />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewPost={() => setShowNewPost(true)}
      />

      {/* New Post Modal */}
      <NewPostModal isOpen={showNewPost} onClose={() => setShowNewPost(false)} onPostCreated={handlePostCreated} />
    </div>
  )
}
