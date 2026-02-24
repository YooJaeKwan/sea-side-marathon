"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Waves, User, ArrowRight, Trophy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
    { value: "10km", label: "10km", emoji: "🏃" },
    { value: "5km", label: "5km", emoji: "🏃‍♂️" },
    { value: "Tea", label: "Tea", emoji: "☕" },
]

export default function SignupPage() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [nickname, setNickname] = useState(session?.user?.name || "")
    const [category, setCategory] = useState("")
    const [loading, setLoading] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async () => {
        if (!nickname.trim()) {
            setError("이름을 입력해주세요")
            return
        }
        if (nickname.trim().length < 2) {
            setError("이름은 2글자 이상이어야 합니다")
            return
        }
        if (!category) {
            setError("참가부문을 선택해주세요")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: nickname.trim(),
                    initials: nickname.trim().slice(0, 2).toUpperCase(),
                    category,
                    isOnboarded: true,
                }),
            })

            if (!res.ok) throw new Error("프로필 저장에 실패했습니다")

            await update()
            setCompleted(true)
            setTimeout(() => {
                window.location.href = "/"
            }, 2000)
        } catch {
            setError("오류가 발생했습니다. 다시 시도해주세요.")
        } finally {
            setLoading(false)
        }
    }

    if (completed) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-[#f0f7ff] via-[#e6f2ff] to-[#cce8f9] max-w-lg mx-auto px-6">
                <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">가입 완료! 🎉</h1>
                    <p className="text-sm text-gray-500 text-center leading-relaxed">
                        {nickname}님, Sea Side Pacer에 오신 걸 환영합니다!<br />
                        피드로 이동합니다...
                    </p>
                    <div className="w-6 h-6 border-2 border-ocean/30 border-t-ocean rounded-full animate-spin mt-2" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-b from-[#f0f7ff] via-[#e6f2ff] to-[#cce8f9] relative overflow-hidden max-w-lg mx-auto">
            {/* Wave bg */}
            <div className="absolute inset-0 pointer-events-none">
                <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: "30%" }}>
                    <path fill="rgba(0, 119, 182, 0.12)">
                        <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0,256L60,245.3C120,235,240,213,360,208C480,203,600,213,720,229.3C840,245,960,267,1080,272C1200,277,1320,267,1380,261.3L1440,256L1440,320L0,320Z;M0,288L60,272C120,256,240,224,360,213.3C480,203,600,213,720,218.7C840,224,960,224,1080,213.3C1200,203,1320,181,1380,170.7L1440,160L1440,320L0,320Z;M0,256L60,245.3C120,235,240,213,360,208C480,203,600,213,720,229.3C840,245,960,267,1080,272C1200,277,1320,267,1380,261.3L1440,256L1440,320L0,320Z" />
                    </path>
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
                {/* Welcome */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-ocean-light via-ocean to-ocean-dark shadow-xl shadow-ocean/25 mb-5">
                        <Waves className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        환영합니다! 🎉
                    </h1>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Sea Side 크루에 합류하셨습니다<br />
                        정보를 입력하고 시작하세요
                    </p>
                </div>

                {/* Form */}
                <div className="w-full max-w-xs space-y-6">
                    {/* Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <User className="w-4 h-4 text-ocean" />
                            이름
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => { setNickname(e.target.value); setError("") }}
                            placeholder="크루에서 사용할 이름"
                            maxLength={10}
                            className="w-full h-13 bg-white/80 backdrop-blur-sm border border-ocean/15 rounded-2xl px-4 text-base font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean/30 transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">{nickname.length}/10자</p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Trophy className="w-4 h-4 text-coral" />
                            참가부문
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => { setCategory(cat.value); setError("") }}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-2 transition-all cursor-pointer",
                                        category === cat.value
                                            ? "border-ocean bg-ocean/5 shadow-md shadow-ocean/10"
                                            : "border-gray-200 bg-white/60 hover:border-ocean/30"
                                    )}
                                >
                                    <span className="text-2xl">{cat.emoji}</span>
                                    <span className={cn(
                                        "text-sm font-bold",
                                        category === cat.value ? "text-ocean" : "text-gray-700"
                                    )}>
                                        {cat.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !nickname.trim() || !category}
                        className="w-full h-13 bg-ocean text-white font-bold text-[15px] rounded-2xl shadow-lg shadow-ocean/25 flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:shadow-ocean/30 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? (
                            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                시작하기
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
