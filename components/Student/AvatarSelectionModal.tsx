"use client";

import { useState } from "react";
import { updateAvatarUrl } from "@/server/profile.server";
import { X, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface AvatarSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAvatarUrl?: string | null;
}

const PREDEFINED_CHARACTERS = [
    // Pixel RPG Vibe
    { name: "Pixel Hero", style: "pixel-art", seed: "Paladin2" },
    { name: "Pixel Mage", style: "pixel-art", seed: "Mage5" },
    { name: "Pixel Rogue", style: "pixel-art", seed: "Rogue9" },
    { name: "Pixel Ninja", style: "pixel-art", seed: "Ninja1" },

    // Cute Mechs
    { name: "Astro Bot", style: "bottts", seed: "Astro" },
    { name: "Mecha Tech", style: "bottts", seed: "MechaX" },
    { name: "Sparky Bot", style: "bottts", seed: "Spark" },
    { name: "Byte", style: "bottts", seed: "ByteBot" },

    // Adventurers
    { name: "Explorer", style: "adventurer", seed: "Destiny" },
    { name: "Pioneer", style: "adventurer", seed: "Jasper" },
    { name: "Voyager", style: "adventurer", seed: "Felix" },
    { name: "Scout", style: "adventurer", seed: "Luna" },

    // Modern Academic
    { name: "Scholar", style: "micah", seed: "Alex" },
    { name: "Visionary", style: "micah", seed: "Jordan" },
    { name: "Creator", style: "micah", seed: "Sam" },
    { name: "Thinker", style: "micah", seed: "Taylor" },
];

export function AvatarSelectionModal({ isOpen, onClose, currentAvatarUrl }: AvatarSelectionModalProps) {
    const router = useRouter();
    const [selectedUrl, setSelectedUrl] = useState<string>(currentAvatarUrl || "");
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const getCharacterUrl = (char: { style: string; seed: string }) => {
        return `https://api.dicebear.com/9.x/${char.style}/svg?seed=${char.seed}&backgroundColor=c0aede,ffdfbf,ffd5dc,b6e3f4`;
    };

    const handleSelect = (char: { style: string; seed: string }) => {
        setSelectedUrl(getCharacterUrl(char));
    };

    const handleSave = async () => {
        if (!selectedUrl) return;
        setIsSaving(true);
        const res = await updateAvatarUrl(selectedUrl);
        setIsSaving(false);

        if (res.success) {
            router.refresh();
            onClose();
        } else {
            alert(res.error || "Failed to save character");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
                    <div>
                        <h2 className="text-lg font-black text-indigo-900">Choose Your Character</h2>
                        <p className="text-xs font-bold text-indigo-500/70 uppercase tracking-widest mt-0.5">Customise your avatar</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors shadow-sm"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {PREDEFINED_CHARACTERS.map((char) => {
                            const url = getCharacterUrl(char);
                            const isSelected = selectedUrl === url;

                            return (
                                <button
                                    key={`${char.style}-${char.seed}`}
                                    onClick={() => handleSelect(char)}
                                    className={`relative group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                                        isSelected
                                            ? "border-indigo-500 bg-indigo-50 shadow-md transform scale-[1.02]"
                                            : "border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30"
                                    }`}
                                >
                                    <div className={`w-20 h-20 rounded-xl overflow-hidden ${isSelected ? 'ring-4 ring-indigo-200' : ''} transition-all`}>
                                        <img src={url} alt={char.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`}>
                                        {char.name}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 mt-auto">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedUrl || isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200"
                    >
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Character
                    </button>
                </div>
            </div>
        </div>
    );
}
