"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { FeedPage } from "@/components/feed-page"
import { CalendarPage } from "@/components/calendar-page"
import { RankingPage } from "@/components/ranking-page"
import { ProfilePage } from "@/components/profile-page"
import { NewPostModal } from "@/components/new-post-modal"
import { WaveDivider } from "@/components/wave-divider"
import { mockPosts } from "@/lib/mock-data"
import { Waves } from "lucide-react"

const TAB_TITLES: Record<string, string> = {
  feed: "피드",
  calendar: "내 기록",
  ranking: "랭킹",
  profile: "프로필",
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("feed")
  const [showNewPost, setShowNewPost] = useState(false)

  return (
    <div className="min-h-dvh bg-background max-w-lg mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6" />
            <h1 className="text-base font-bold tracking-tight">Sea Side Pacer</h1>
          </div>
          <span className="text-xs font-medium opacity-80">{TAB_TITLES[activeTab]}</span>
        </div>
        <WaveDivider />
      </header>

      {/* Main content */}
      <main className="px-4 pt-4 pb-28">
        {activeTab === "feed" && <FeedPage posts={mockPosts} />}
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
      <NewPostModal isOpen={showNewPost} onClose={() => setShowNewPost(false)} />
    </div>
  )
}
