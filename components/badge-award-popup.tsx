"use client"

import { useState, useEffect } from "react"
import { Award, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface EarnedBadge {
    id: string
    name: string
    description: string
    icon: string
    earnedAt: string | Date
}

interface BadgeAwardPopupProps {
    badges: EarnedBadge[]
    onClose: () => void
}

export function BadgeAwardPopup({ badges, onClose }: BadgeAwardPopupProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const currentBadge = badges[currentIndex]

    const handleNext = () => {
        if (currentIndex < badges.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            onClose()
        }
    }

    if (!currentBadge) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-card rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Animated Background Sparkles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-primary/20 blur-3xl animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-accent/20 blur-3xl animate-pulse delay-700" />
                </div>

                <div className="relative p-8 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent p-1 shadow-lg shadow-primary/30 animate-in zoom-in-50 duration-700 delay-200">
                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-5xl">
                            {currentBadge.icon}
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-bold tracking-widest uppercase mb-1 animate-in slide-in-from-top-2 duration-500 delay-300">
                            <Award className="w-3 h-3" />
                            Awesome! New Achievement
                        </div>
                        <h3 className="text-2xl font-black text-card-foreground leading-tight animate-in slide-in-from-top-4 duration-500 delay-400">
                            {currentBadge.name}
                        </h3>
                        <p className="text-sm text-muted-foreground px-4 animate-in slide-in-from-top-6 duration-500 delay-500">
                            {currentBadge.description}
                        </p>
                    </div>

                    <div className="mt-10 w-full space-y-3">
                        <button
                            onClick={handleNext}
                            className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all animate-in slide-in-from-bottom-8 duration-500 delay-700"
                        >
                            {currentIndex < badges.length - 1 ? "Next Reward" : "Keep Running"}
                            <Check className="w-5 h-5" />
                        </button>
                        <p className="text-[10px] text-muted-foreground/60 transition-opacity animate-in fade-in duration-1000 delay-1000">
                            You're doing amazing!
                        </p>
                    </div>
                </div>

                {/* Multi-badge indicator */}
                {badges.length > 1 && (
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-full border border-primary/20">
                        {currentIndex + 1} / {badges.length}
                    </div>
                )}
            </div>

            {/* Confetti effect simulation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float opacity-0 text-xl"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                            transform: `scale(${0.5 + Math.random()}) rotate(${Math.random() * 360}deg)`
                        }}
                    >
                        ✨
                    </div>
                ))}
            </div>
        </div>
    )
}
