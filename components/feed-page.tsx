"use client"

import { useState, useEffect, useCallback } from "react"
import { Heart, MessageCircle, Waves, Clock, MapPin, ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface PostComment {
  id: string
  userId: string
  user: { name: string; initials: string }
  text: string
  createdAt: string
}

interface RunningPost {
  id: string
  user: { id: string; name: string; avatar: string; initials: string; category: string }
  duration: string
  distance: number
  pace: string
  comment: string
  photo?: string
  likes: number
  waves: number
  comments: PostComment[]
  createdAt: string
  liked: boolean
  waved: boolean
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "방금 전"
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days === 1) return "어제"
  return `${days}일 전`
}

function PostCard({ post, onUpdate }: { post: RunningPost; onUpdate: () => void }) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(post.liked)
  const [waved, setWaved] = useState(post.waved)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [waveCount, setWaveCount] = useState(post.waves)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.comments)
  const [newComment, setNewComment] = useState("")
  const [rippleId, setRippleId] = useState<string | null>(null)

  const handleLike = async () => {
    const prev = liked
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    setRippleId("like")
    setTimeout(() => setRippleId(null), 600)

    try {
      await fetch(`/api/posts/${post.id}/like`, { method: "POST" })
    } catch {
      setLiked(prev)
      setLikeCount(prev ? likeCount : likeCount - 1)
    }
  }

  const handleWave = async () => {
    const prev = waved
    setWaved(!waved)
    setWaveCount(waved ? waveCount - 1 : waveCount + 1)
    setRippleId("wave")
    setTimeout(() => setRippleId(null), 600)

    try {
      await fetch(`/api/posts/${post.id}/wave`, { method: "POST" })
    } catch {
      setWaved(prev)
      setWaveCount(prev ? waveCount : waveCount - 1)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment.trim() }),
      })
      if (res.ok) {
        const c = await res.json()
        setComments([...comments, c])
        setNewComment("")
        onUpdate()
      }
    } catch {
      // ignore
    }
  }

  const handleDeletePost = async () => {
    if (!confirm("정말 이 게시물을 삭제하시겠습니까?")) return
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" })
      if (res.ok) onUpdate()
    } catch {
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" })
      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId))
        onUpdate()
      }
    } catch {
      alert("댓글 삭제 중 오류가 발생했습니다.")
    }
  }

  return (
    <article className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
      {/* User header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar className="w-10 h-10 ring-2 ring-primary/20">
          {post.user.avatar && <AvatarImage src={post.user.avatar} alt={post.user.name} />}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {post.user.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-card-foreground">{post.user.name}</p>
            {post.user.category && (
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                post.user.category === "10km" ? "bg-red-100 text-red-600" :
                  post.user.category === "5km" ? "bg-blue-100 text-blue-600" :
                    "bg-orange-100 text-orange-600"
              )}>
                {post.user.category}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
        </div>
        {session?.user?.id === post.user.id && (
          <button onClick={handleDeletePost} className="p-2 text-muted-foreground/40 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
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

      {/* Photo */}
      {post.photo && (
        <div className="px-4 pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.photo} alt="러닝 사진" className="w-full rounded-xl object-cover max-h-64" />
        </div>
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
          <span className="font-medium">{comments.length}</span>
          {comments.length > 0 && (
            showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-border/50 bg-muted/30 px-4 py-3 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-medium">
                  {comment.user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-card-foreground">{comment.user.name}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-xs text-card-foreground/80 mt-0.5">{comment.text}</p>
              </div>
              {session?.user?.id === comment.userId && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-muted-foreground/30 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* New comment input */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="댓글 달기..."
              className="flex-1 bg-card rounded-xl px-3 py-2 text-xs text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 border border-border/50"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="text-primary disabled:text-muted-foreground/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </article>
  )
}



export function FeedPage({
  posts,
  loading,
  onRefresh,
}: {
  posts: RunningPost[]
  loading: boolean
  onRefresh: () => void
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
          <Waves className="w-8 h-8 text-primary/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-card-foreground">아직 인증글이 없어요</p>
          <p className="text-xs text-muted-foreground mt-1">첫 러닝을 인증해보세요! 🏃</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onUpdate={onRefresh} />
        ))
      )}
    </div>
  )
}
