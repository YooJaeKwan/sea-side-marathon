"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Heart, MessageCircle, Clock, MapPin, ChevronDown, ChevronUp, Send, Trash2, Pencil } from "lucide-react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface PostComment {
  id: string
  userId: string
  user: { name: string; initials: string; avatar: string }
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
  reactions: Record<string, number>
  totalReactions: number
  userReaction: string | null
  comments: PostComment[]
  createdAt: string
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

const REACTIONS = ["❤️", "🔥", "🤣", "👏", "👍"]

function PostCard({ post, onUpdate, onEdit }: { post: RunningPost; onUpdate: () => void; onEdit?: (post: RunningPost) => void }) {
  const { data: session } = useSession()
  const [userReaction, setUserReaction] = useState<string | null>(post.userReaction)
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(post.reactions || {})
  const [totalReactions, setTotalReactions] = useState(post.totalReactions || 0)
  const [showReactions, setShowReactions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.comments)
  const [newComment, setNewComment] = useState("")
  const [rippleId, setRippleId] = useState<string | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  // Sync state with props when data is refreshed
  useEffect(() => {
    setUserReaction(post.userReaction)
    setReactionCounts(post.reactions || {})
    setTotalReactions(post.totalReactions || 0)
    setComments(post.comments)
  }, [post])

  const handleReact = async (type: string) => {
    const isSameReaction = userReaction === type
    const prevReaction = userReaction
    const prevCounts = { ...reactionCounts }
    const prevTotal = totalReactions

    // Optimistic UI update
    if (isSameReaction) {
      // Removing reaction
      setUserReaction(null)
      setTotalReactions(prevTotal - 1)
      setReactionCounts(prev => ({ ...prev, [type]: Math.max(0, (prev[type] || 0) - 1) }))
    } else {
      // Adding or changing reaction
      setUserReaction(type)
      if (prevReaction) {
        // Changing
        setReactionCounts(prev => ({
          ...prev,
          [prevReaction]: Math.max(0, (prev[prevReaction] || 0) - 1),
          [type]: (prev[type] || 0) + 1
        }))
      } else {
        // New reaction
        setTotalReactions(prevTotal + 1)
        setReactionCounts(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }))
      }
    }

    setShowReactions(false)
    setRippleId("react")
    setTimeout(() => setRippleId(null), 600)

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      })
      if (res.ok) {
        onUpdate()
      }
    } catch {
      // Rollback on failure
      setUserReaction(prevReaction)
      setReactionCounts(prevCounts)
      setTotalReactions(prevTotal)
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
        <Avatar className="w-10 h-10 border-2 border-white ring-1 ring-primary/10 shadow-sm">
          {post.user.avatar && <AvatarImage src={post.user.avatar} alt={post.user.name} referrerPolicy="no-referrer" />}
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
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit?.(post)} className="p-2 text-muted-foreground/40 hover:text-primary transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={handleDeletePost} className="p-2 text-muted-foreground/40 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
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

      {/* Photo (Now before comment) */}
      {post.photo && (
        <div className="px-4 pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.photo} alt="러닝 사진" className="w-full h-auto rounded-xl max-h-[500px] object-contain bg-muted/10 border border-border/50" />
        </div>
      )}

      {/* Comment text (Now after photo) */}
      {post.comment && (
        <p className="px-4 pb-3 text-sm leading-relaxed text-card-foreground">{post.comment}</p>
      )}

      {/* Reactions & Comments Summary */}
      {(totalReactions > 0 || comments.length > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-xs mt-1 border-t border-border/30">
          <div className="flex items-center gap-0.5 h-6">
            {totalReactions > 0 ? (
              <>
                <div className="flex items-center gap-0.5">
                  {Object.entries(reactionCounts)
                    .filter(([_, count]) => count > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([emoji]) => (
                      <span
                        key={emoji}
                        className="text-[14px] leading-none"
                      >
                        {emoji}
                      </span>
                    ))}
                </div>
                <span className="text-muted-foreground font-medium mt-0.5 ml-0.5 flex items-center">{totalReactions}</span>
              </>
            ) : <span />}
          </div>
          {comments.length > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-muted-foreground hover:underline font-medium"
            >
              댓글 {comments.length}개
            </button>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="border-t border-border/50 px-2 py-1 flex items-stretch">
        <div
          className="relative flex-1 group"
          onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setShowReactions(true)}
          onMouseLeave={() => window.matchMedia("(hover: hover)").matches && setShowReactions(false)}
        >
          {/* Invisible overlay for tap to close on mobile */}
          {showReactions && (
            <div
              className="fixed inset-0 z-40 md:hidden"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowReactions(false);
              }}
            />
          )}

          {/* Reaction Picker Popover */}
          <div className={cn(
            "absolute left-2 bottom-full mb-1.5 z-50 bg-card/95 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-border/50 flex flex-nowrap items-center p-1.5 gap-1 transition-all duration-300 origin-bottom-left",
            showReactions ? "opacity-100 scale-100 visible translate-y-0" : "opacity-0 scale-90 invisible pointer-events-none translate-y-2"
          )}>
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleReact(emoji);
                }}
                className="w-10 h-10 flex items-center justify-center text-[22px] hover:bg-muted rounded-full transition-transform hover:-translate-y-1 hover:scale-110 shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (userReaction) handleReact(userReaction);
              else setShowReactions(!showReactions);
            }}
            className={cn(
              "flex items-center justify-center gap-2 w-full p-2.5 rounded-lg transition-colors text-[13px] font-bold select-none",
              userReaction ? "text-primary" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            {userReaction ? (
              <div className="flex items-center gap-1.5 animate-in zoom-in spin-in-6 duration-200">
                <span className="text-base leading-none shrink-0">{userReaction}</span>
                <span className="shrink-0 whitespace-nowrap">
                  {userReaction === "❤️" ? "좋아요" : userReaction === "👏" ? "응원해요" : userReaction === "🔥" ? "대단해요" : userReaction === "🤣" ? "재밌어요" : userReaction === "👍" ? "최고예요" : "반응"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Heart className="w-[18px] h-[18px] shrink-0" />
                <span className="shrink-0 whitespace-nowrap">반응</span>
              </div>
            )}
          </button>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center gap-2 flex-1 p-2.5 rounded-lg transition-colors text-[13px] font-bold text-muted-foreground hover:bg-muted/50 select-none"
        >
          <MessageCircle className="w-[18px] h-[18px] shrink-0" />
          <span className="shrink-0 whitespace-nowrap">댓글 달기</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-border/50 bg-muted/30 px-4 py-3 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="w-6 h-6 shrink-0 border border-white ring-1 ring-primary/10">
                <AvatarImage src={comment.user.avatar} referrerPolicy="no-referrer" />
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
  loadingMore,
  hasMore,
  onLoadMore,
  onRefresh,
  onEdit,
  feedFilter = "all",
  onFeedFilterChange,
}: {
  posts: RunningPost[]
  loading: boolean
  loadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onRefresh: () => void
  onEdit?: (post: RunningPost) => void
  feedFilter?: "all" | "me"
  onFeedFilterChange?: (filter: "all" | "me") => void
}) {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && onLoadMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, onLoadMore])
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
      {onFeedFilterChange && (
        <div className="flex bg-muted/50 p-1 rounded-xl mb-4">
          <button
            onClick={() => onFeedFilterChange("all")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
              feedFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            전체 피드
          </button>
          <button
            onClick={() => onFeedFilterChange("me")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
              feedFilter === "me"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            내 피드
          </button>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
          <Heart className="w-8 h-8 text-primary/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-card-foreground">아직 인증글이 없어요</p>
          <p className="text-xs text-muted-foreground mt-1">첫 러닝을 인증해보세요! 🏃</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onUpdate={onRefresh} onEdit={onEdit} />
        ))
      )}

      {hasMore && (
        <div ref={observerTarget} className="py-4 flex justify-center h-12">
          {loadingMore && <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
        </div>
      )}
    </div>
  )
}
