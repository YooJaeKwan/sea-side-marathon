"use client"

import { useState } from "react"
import { Heart, MessageCircle, Waves, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { RunningPost } from "@/lib/mock-data"

function PostCard({ post }: { post: RunningPost }) {
  const [liked, setLiked] = useState(post.liked)
  const [waved, setWaved] = useState(post.waved)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [waveCount, setWaveCount] = useState(post.waves)
  const [showComments, setShowComments] = useState(false)
  const [rippleId, setRippleId] = useState<string | null>(null)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    setRippleId("like")
    setTimeout(() => setRippleId(null), 600)
  }

  const handleWave = () => {
    setWaved(!waved)
    setWaveCount(waved ? waveCount - 1 : waveCount + 1)
    setRippleId("wave")
    setTimeout(() => setRippleId(null), 600)
  }

  return (
    <article className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
      {/* User header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar className="w-10 h-10 ring-2 ring-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {post.user.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-card-foreground">{post.user.name}</p>
          <p className="text-xs text-muted-foreground">{post.createdAt}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-3 py-2 flex-1">
          <Clock className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground leading-none">시간</p>
            <p className="text-sm font-bold text-primary">{post.duration}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-accent/10 rounded-lg px-3 py-2 flex-1">
          <MapPin className="w-4 h-4 text-accent" />
          <div>
            <p className="text-[10px] text-muted-foreground leading-none">거리</p>
            <p className="text-sm font-bold text-accent">{post.distance}km</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-2 flex-1">
          <svg className="w-4 h-4 text-foreground/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <div>
            <p className="text-[10px] text-muted-foreground leading-none">페이스</p>
            <p className="text-sm font-bold text-card-foreground">{post.pace}</p>
          </div>
        </div>
      </div>

      {/* Comment text */}
      {post.comment && (
        <p className="px-4 pb-3 text-sm leading-relaxed text-card-foreground">{post.comment}</p>
      )}

      {/* Action bar */}
      <div className="flex items-center border-t border-border/50 px-4 py-2.5">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-sm relative overflow-hidden",
            liked ? "text-red-500" : "text-muted-foreground"
          )}
        >
          {rippleId === "like" && (
            <span className="absolute inset-0 bg-red-500/10 rounded-full animate-ripple" />
          )}
          <Heart className={cn("w-4 h-4 relative z-10", liked && "fill-current")} />
          <span className="relative z-10 font-medium">{likeCount}</span>
        </button>
        <button
          onClick={handleWave}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-sm relative overflow-hidden",
            waved ? "text-primary" : "text-muted-foreground"
          )}
        >
          {rippleId === "wave" && (
            <span className="absolute inset-0 bg-primary/10 rounded-full animate-ripple" />
          )}
          <Waves className={cn("w-4 h-4 relative z-10", waved && "stroke-[2.5px]")} />
          <span className="relative z-10 font-medium">{waveCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground text-sm ml-auto"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium">{post.comments.length}</span>
          {post.comments.length > 0 && (
            showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Comments */}
      {showComments && post.comments.length > 0 && (
        <div className="border-t border-border/50 bg-muted/30 px-4 py-3 space-y-3">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-medium">
                  {comment.user.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-card-foreground">{comment.user.name}</span>
                  <span className="text-[10px] text-muted-foreground">{comment.createdAt}</span>
                </div>
                <p className="text-xs text-card-foreground/80 mt-0.5">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

export function FeedPage({ posts }: { posts: RunningPost[] }) {
  return (
    <div className="space-y-4">
      {/* D-day banner */}
      <div className="bg-primary rounded-2xl p-4 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,50 Q100,0 200,50 T400,50 V100 H0 Z" fill="currentColor" />
            <path d="M0,60 Q100,20 200,60 T400,60 V100 H0 Z" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium opacity-80">Sea Side Marathon</p>
            <p className="text-2xl font-bold mt-0.5">D-81</p>
            <p className="text-xs opacity-70 mt-1">2026.05.16 영종도</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">이번 주 크루 총 거리</p>
            <p className="text-xl font-bold">87.3 km</p>
          </div>
        </div>
      </div>

      {/* Feed posts */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
