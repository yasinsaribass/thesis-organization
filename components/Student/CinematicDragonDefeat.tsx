"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { X, Trophy, Loader2, Skull } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CinematicDragonDefeatProps {
    onComplete: () => void;
    videoUrl?: string;
}

export function CinematicDragonDefeat({ onComplete, videoUrl = "/dragon-defeat.mp4" }: CinematicDragonDefeatProps) {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [canSkip, setCanSkip] = useState(false);
    const [showContinue, setShowContinue] = useState(false);

    useEffect(() => {
        // Show skip button after 4 seconds
        const skipTimer = setTimeout(() => {
            setCanSkip(true);
        }, 4000);

        return () => {
            clearTimeout(skipTimer);
        };
    }, []);

    const triggerConfetti = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleVideoEnd = () => {
        setShowContinue(true);
        triggerConfetti();
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden font-sans">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15)_0%,transparent_70%)] pointer-events-none"></div>

            {/* Video Container */}
            <div className={`relative w-full h-full transition-opacity duration-1500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                {!hasError ? (
                    <>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover grayscale-[0.2] contrast-125"
                            onEnded={handleVideoEnd}
                            onCanPlay={() => {
                                setIsLoaded(true);
                                videoRef.current?.play().catch(err => {
                                    console.log("Autoplay blocked:", err);
                                });
                            }}
                            onError={() => {
                                setHasError(true);
                                setIsLoaded(true);
                            }}
                        />
                        
                        {/* Dramatic Overlays while playing */}
                        {!showContinue && isLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-red-600/20 backdrop-blur-md rounded-full flex items-center justify-center border border-red-500/30 mb-6 animate-pulse">
                                        <Skull className="w-10 h-10 text-red-500" />
                                    </div>
                                    <h2 className="text-6xl md:text-8xl font-black text-white tracking-[0.2em] italic drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] uppercase">
                                        {t.student.bossDefeated}
                                    </h2>
                                </div>
                            </div>
                        )}

                        {/* Final Success Screen */}
                        {showContinue && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 p-6 text-center">
                                <div className="relative mb-8">
                                    <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-2xl animate-pulse"></div>
                                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.4)] transform rotate-12">
                                        <Trophy className="w-12 h-12 text-white" />
                                    </div>
                                </div>

                                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mb-4 tracking-tighter uppercase italic">
                                    {t.student.bossDefeated}
                                </h2>
                                <p className="text-amber-200/80 text-lg md:text-xl font-bold max-w-2xl mb-12 uppercase tracking-[0.2em]">
                                    {t.student.bossDefeatedSubtitle}
                                </p>

                                <button 
                                    onClick={onComplete}
                                    className="group relative px-16 py-6 bg-white text-black font-black uppercase tracking-[0.4em] rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                                >
                                    <span className="relative z-10 transition-colors group-hover:text-white">Return to Realm</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                </button>
                                
                                <div className="mt-12 flex items-center gap-4 opacity-40">
                                    <div className="h-[1px] w-12 bg-white/50"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[1em] text-white">Legendary Status</span>
                                    <div className="h-[1px] w-12 bg-white/50"></div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 space-y-8 bg-gradient-to-b from-gray-900 to-black">
                         <div className="relative">
                            <div className="absolute -inset-8 bg-red-600/20 rounded-full blur-3xl"></div>
                            <Skull className="w-24 h-24 text-red-600 relative animate-bounce" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">{t.student.bossDefeated}</h2>
                            <p className="text-red-200/60 font-bold max-w-md mx-auto uppercase tracking-widest leading-relaxed">
                                {t.student.bossDefeatedSubtitle}
                            </p>
                        </div>
                        <button 
                            onClick={onComplete}
                            className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-2xl"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Cinematic Ambient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>
                <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.5)] pointer-events-none"></div>
            </div>

            {/* Skip Button */}
            {canSkip && !showContinue && (
                <button
                    onClick={handleSkip}
                    className="absolute top-10 right-10 flex items-center gap-3 px-8 py-3 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 text-white rounded-full transition-all group z-[10000] animate-in fade-in duration-700"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 group-hover:opacity-100">Skip Cinematic</span>
                    <X className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:rotate-90 transition-transform" />
                </button>
            )}

            {/* Loading State */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                    <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-[1em] text-white/20">Preparing Victory</span>
                </div>
            )}
        </div>
    );
}
