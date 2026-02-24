"use client"

import { signIn } from "next-auth/react"
import { Waves, MapPin, Trophy, Calendar, Users } from "lucide-react"
import { useEffect, useState } from "react"

function useDday() {
    const [days, setDays] = useState(0)

    useEffect(() => {
        const target = new Date("2026-05-16T00:00:00+09:00")
        const update = () => {
            const now = new Date()
            const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            setDays(diff > 0 ? diff : 0)
        }
        update()
        const id = setInterval(update, 60000)
        return () => clearInterval(id)
    }, [])

    return days
}

export default function LoginPage() {
    const dday = useDday()

    const features = [
        { icon: Calendar, label: "매일 러닝 인증", color: "text-ocean" },
        { icon: Trophy, label: "배지 & 랭킹", color: "text-coral" },
        { icon: Users, label: "크루와 함께", color: "text-ocean-light" },
    ]

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-b from-[#f0f7ff] via-[#e6f2ff] to-[#cce8f9] relative overflow-hidden max-w-lg mx-auto">
            {/* Animated wave background layers */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-ocean/5 to-transparent" />

                {/* Wave layer 1 */}
                <svg
                    className="absolute bottom-0 w-full"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    style={{ height: "35%" }}
                >
                    <path
                        fill="rgba(0, 119, 182, 0.12)"
                        d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,133.3C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z"
                    >
                        <animate
                            attributeName="d"
                            dur="10s"
                            repeatCount="indefinite"
                            values="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,133.3C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z;M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,170.7C672,160,768,192,864,213.3C960,235,1056,245,1152,234.7C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z;M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,133.3C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z"
                        />
                    </path>
                </svg>

                {/* Wave layer 2 */}
                <svg
                    className="absolute bottom-0 w-full"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    style={{ height: "30%" }}
                >
                    <path
                        fill="rgba(0, 180, 216, 0.08)"
                        d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,218.7C672,224,768,224,864,213.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L0,320Z"
                    >
                        <animate
                            attributeName="d"
                            dur="8s"
                            repeatCount="indefinite"
                            values="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,218.7C672,224,768,224,864,213.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L0,320Z;M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,229.3C672,245,768,267,864,272C960,277,1056,267,1152,245.3C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z;M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,218.7C672,224,768,224,864,213.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L0,320Z"
                        />
                    </path>
                </svg>

                {/* Wave layer 3 (deepest) */}
                <svg
                    className="absolute bottom-0 w-full"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    style={{ height: "22%" }}
                >
                    <path fill="rgba(0, 119, 182, 0.18)">
                        <animate
                            attributeName="d"
                            dur="6s"
                            repeatCount="indefinite"
                            values="M0,320L48,304C96,288,192,256,288,256C384,256,480,288,576,293.3C672,299,768,277,864,272C960,267,1056,277,1152,282.7C1248,288,1344,288,1392,288L1440,288L1440,320L0,320Z;M0,304L48,298.7C96,293,192,283,288,277.3C384,272,480,272,576,277.3C672,283,768,293,864,298.7C960,304,1056,304,1152,298.7C1248,293,1344,283,1392,277.3L1440,272L1440,320L0,320Z;M0,320L48,304C96,288,192,256,288,256C384,256,480,288,576,293.3C672,299,768,277,864,272C960,267,1056,277,1152,282.7C1248,288,1344,288,1392,288L1440,288L1440,320L0,320Z"
                        />
                    </path>
                </svg>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
                {/* Logo + Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-ocean-light via-ocean to-ocean-dark shadow-xl shadow-ocean/25 mb-6 relative">
                        <Waves className="w-12 h-12 text-white" />
                        {/* Pulse ring */}
                        <div className="absolute inset-0 rounded-3xl bg-ocean/20 animate-ping" style={{ animationDuration: "3s" }} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-1">
                        Sea Side Marathon
                    </h1>
                    <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>영종도 Sea Side Marathon</span>
                    </div>
                </div>

                {/* D-day Badge */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-ocean/10 rounded-full px-5 py-2.5 shadow-sm">
                        <span className="text-xs font-medium text-muted-foreground">대회까지</span>
                        <span className="text-xl font-bold text-ocean tabular-nums">D-{dday}</span>
                    </div>
                </div>

                {/* Feature pills */}
                <div className="flex gap-3 mb-10">
                    {features.map((f) => (
                        <div
                            key={f.label}
                            className="flex flex-col items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/80"
                        >
                            <f.icon className={`w-5 h-5 ${f.color}`} />
                            <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{f.label}</span>
                        </div>
                    ))}
                </div>

                {/* Kakao Login Button */}
                <div className="w-full max-w-xs">
                    <button
                        onClick={() => signIn("kakao", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-[15px] transition-all duration-200 hover:shadow-lg hover:shadow-yellow-200/50 active:scale-[0.97] shadow-md cursor-pointer"
                        style={{
                            backgroundColor: "#FEE500",
                            color: "#191919",
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12 3C6.477 3 2 6.463 2 10.691c0 2.722 1.8 5.108 4.514 6.47l-1.149 4.267a.436.436 0 00.67.462l4.926-3.262c.34.033.686.054 1.039.054 5.523 0 10-3.464 10-7.691S17.523 3 12 3"
                                fill="#191919"
                            />
                        </svg>
                        카카오로 시작하기
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        카카오 계정으로 1초 만에 시작하세요
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 pb-8 text-center">
                <p className="text-[11px] text-gray-400/80">
                    © 2026 Sea Side Marathon Crew
                </p>
            </div>
        </div>
    )
}
