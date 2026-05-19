"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { X, Play, Loader2 } from "lucide-react";

interface CinematicSuccessProps {
    onComplete: () => void;
    videoUrl?: string;
}

export function CinematicSuccess({ onComplete, videoUrl = "/success-animation.mp4" }: CinematicSuccessProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [canSkip, setCanSkip] = useState(false);
    const [showContinue, setShowContinue] = useState(false);

    useEffect(() => {
        // Show skip button after 5 seconds
        const skipTimer = setTimeout(() => {
            setCanSkip(true);
        }, 5000);

        return () => {
            clearTimeout(skipTimer);
        };
    }, []);


    const handleVideoEnd = () => {
        console.log("Video naturally ended");
        setShowContinue(true);
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
            {/* Video Container - Full Screen */}
            <div className={`relative w-full h-full transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                {!hasError ? (
                    <>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                            onEnded={handleVideoEnd}
                            onCanPlay={() => {
                                console.log("Video can play, duration:", videoRef.current?.duration);
                                setIsLoaded(true);
                            }}
                            onError={(e) => {
                                console.error("Video play error:", e);
                                setHasError(true);
                                setIsLoaded(true);
                            }}
                        />
                        
                        {/* Final Overlay when video ends */}
                        {showContinue && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                                <h2 className="text-5xl font-black text-white mb-8 tracking-tighter italic">ADVENTURE AWAITS</h2>
                                <button 
                                    onClick={onComplete}
                                    className="group relative px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
                                >
                                    <span className="relative z-10">Continue to Dashboard</span>
                                    <div className="absolute inset-0 bg-indigo-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <style jsx>{`
                                        button:hover span { color: white; transition: color 0.3s; }
                                    `}</style>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                            <Play className="w-12 h-12 text-indigo-500 fill-indigo-500" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight italic">YOUR JOURNEY BEGINS</h2>
                        <p className="text-indigo-200/60 font-medium max-w-md">
                            Your thesis has been successfully registered. Get ready to embark on your academic adventure!
                        </p>
                        <button 
                            onClick={onComplete}
                            className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-colors"
                        >
                            Enter Dashboard
                        </button>
                    </div>
                )}

                {/* Ambient Gradient Overlay for Cinematic Feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
            </div>

            {/* Skip Button - Conditional Rendering with Fade In */}
            {canSkip && !showContinue && (
                <button
                    onClick={handleSkip}
                    className="absolute top-8 right-8 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full transition-all group z-10 animate-in fade-in duration-500"
                >
                    <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100">Skip</span>
                    <X className="w-4 h-4" />
                </button>
            )}



            {/* Loading Indicator */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                </div>
            )}

            {/* Cinematic Overlay Text */}
            {isLoaded && !hasError && (
                <div className="absolute bottom-12 left-0 right-0 text-center animate-bounce pointer-events-none">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Success Registered</p>
                </div>
            )}
        </div>
    );
}
