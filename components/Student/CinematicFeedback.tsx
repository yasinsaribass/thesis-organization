"use client";

import { useEffect, useRef, useState } from "react";
import { X, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CinematicFeedbackProps {
    onComplete: () => void;
    videoUrl?: string;
    taskTitle?: string;
    feedbackSnippet?: string;
}

export function CinematicFeedback({ 
    onComplete, 
    videoUrl = "/feedback-received.mp4",
    taskTitle,
    feedbackSnippet
}: CinematicFeedbackProps) {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [canSkip, setCanSkip] = useState(false);
    const [showContinue, setShowContinue] = useState(false);

    useEffect(() => {
        // Show skip button after 2 seconds
        const skipTimer = setTimeout(() => {
            setCanSkip(true);
        }, 2000);

        return () => clearTimeout(skipTimer);
    }, []);

    const handleVideoEnd = () => {
        setShowContinue(true);
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden font-sans">
            {/* Ambient Background Glow (Teal/Emerald for Guidance) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.15)_0%,transparent_70%)] pointer-events-none"></div>

            {/* Video Container */}
            <div className={`relative w-full h-full transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                {!hasError ? (
                    <>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover brightness-75 contrast-110"
                            onEnded={handleVideoEnd}
                            onCanPlay={() => {
                                setIsLoaded(true);
                                // Try to play with sound
                                videoRef.current?.play().catch(err => {
                                    console.log("Autoplay with sound blocked:", err);
                                    // If blocked, we might need to show a play button or keep it muted
                                    // For now, let's just let it be, but we could add a "Tap to Unmute" overlay
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
                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 flex flex-col items-center text-center px-6">
                                    <div className="w-20 h-20 bg-teal-600/20 backdrop-blur-md rounded-full flex items-center justify-center border border-teal-500/30 mb-6 animate-pulse">
                                        <MessageSquare className="w-10 h-10 text-teal-400" />
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-[0.2em] drop-shadow-[0_0_30px_rgba(20,184,166,0.5)] uppercase italic">
                                        {t.student.feedbackReceived || "New Guidance Received"}
                                    </h2>
                                </div>
                            </div>
                        )}

                        {/* Final Reveal Screen */}
                        {showContinue && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 p-6 text-center">
                                <div className="relative mb-8">
                                    <div className="absolute -inset-4 bg-teal-500/20 rounded-full blur-2xl animate-pulse"></div>
                                    <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.4)]">
                                        <Sparkles className="w-12 h-12 text-white" />
                                    </div>
                                </div>

                                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mb-2 tracking-tighter uppercase italic">
                                    {t.student.feedbackReceived || "Guidance Received"}
                                </h2>
                                <p className="text-teal-200/80 text-sm md:text-lg font-bold max-w-2xl mb-8 uppercase tracking-[0.2em]">
                                    {t.student.feedbackReceivedSubtitle || "Your supervisor has spoken."}
                                </p>

                                {/* Preview Card */}
                                {(taskTitle || feedbackSnippet) && (
                                    <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-[2rem] max-w-lg w-full mb-12 animate-in slide-in-from-bottom-4 duration-1000 delay-500">
                                        {taskTitle && (
                                            <h3 className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                                                Task: {taskTitle}
                                            </h3>
                                        )}
                                        {feedbackSnippet && (
                                            <p className="text-white/80 italic font-medium leading-relaxed">
                                                "{feedbackSnippet}..."
                                            </p>
                                        )}
                                    </div>
                                )}

                                <button 
                                    onClick={onComplete}
                                    className="group relative px-16 py-6 bg-white text-black font-black uppercase tracking-[0.4em] rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                                >
                                    <span className="relative z-10 transition-colors group-hover:text-white">View Full Evaluation</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 space-y-8 bg-gradient-to-b from-teal-900/20 to-black">
                         <div className="relative">
                            <div className="absolute -inset-8 bg-teal-600/20 rounded-full blur-3xl"></div>
                            <MessageSquare className="w-24 h-24 text-teal-500 relative animate-bounce" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">
                                {t.student.feedbackReceived || "Guidance Received"}
                            </h2>
                            <p className="text-teal-200/60 font-bold max-w-md mx-auto uppercase tracking-widest leading-relaxed">
                                {t.student.feedbackReceivedSubtitle || "Your supervisor has spoken."}
                            </p>
                        </div>
                        <button 
                            onClick={onComplete}
                            className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-teal-50 hover:text-teal-600 transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-2xl"
                        >
                            Continue
                        </button>
                    </div>
                )}
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
                    <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-[1em] text-white/20">Decrypting Guidance</span>
                </div>
            )}
        </div>
    );
}
