"use client";

import { useState } from "react";
import { Calendar, Clock, Video, BookOpen, Trash2 } from "lucide-react";
import { bookConsultation, cancelConsultation } from "@/server/consultations.server";
import { useLanguage } from "@/context/LanguageContext";

export function StudentConsultationsClient({ studentId, initialAvailableSlots, initialMyConsultations }: { studentId: string, initialAvailableSlots: any[], initialMyConsultations: any[] }) {
    const { t } = useLanguage();
    const [availableSlots, setAvailableSlots] = useState(initialAvailableSlots);
    const [myConsultations, setMyConsultations] = useState(initialMyConsultations);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [topic, setTopic] = useState("");

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;

        const result = await bookConsultation(selectedSlot.id, studentId, topic);
        if (result.error) {
            alert(result.error);
        } else if (result.data) {
            setAvailableSlots(prev => prev.filter(s => s.id !== selectedSlot.id));
            setMyConsultations(prev => [...prev, { ...selectedSlot, ...result.data }]);
            setSelectedSlot(null);
            setTopic("");
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this consultation?")) return;
        
        const result = await cancelConsultation(id, "student");
        if (result.error) {
            alert(result.error);
        } else {
            setMyConsultations(prev => prev.filter(c => c.id !== id));
            // Note: cancelled slots don't automatically go back to available, 
            // since the supervisor might need to re-approve the availability.
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-[#030213]">Consultations</h1>
                <p className="text-gray-500 font-medium">Book a meeting with your supervisor to discuss your progress.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Available Slots */}
                <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <h2 className="text-xl font-black mb-6 text-gray-900 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500"/> Available Slots</h2>
                    
                    {availableSlots.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-bold">No available slots right now.</p>
                            <p className="text-sm text-gray-400 mt-1">Message your supervisor to open up some time slots.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {availableSlots.map(slot => (
                                <div key={slot.id} className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedSlot?.id === slot.id ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`} onClick={() => setSelectedSlot(slot)}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl ${selectedSlot?.id === slot.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {new Date(slot.start_time).getDate()}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${selectedSlot?.id === slot.id ? 'text-indigo-900' : 'text-gray-900'}`}>{new Date(slot.start_time).toLocaleDateString('en-US', { month: 'long', weekday: 'short' })}</p>
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mt-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedSlot && (
                        <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="font-bold text-gray-900 mb-4">Book selected slot</h3>
                            <form onSubmit={handleBook} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Topic / Questions</label>
                                    <textarea required rows={3} value={topic} onChange={e => setTopic(e.target.value)} placeholder="What would you like to discuss?" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                    <BookOpen className="w-5 h-5" /> Book Consultation
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* My Booked Meetings */}
                <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <h2 className="text-xl font-black mb-6 text-gray-900 flex items-center gap-2"><Video className="w-5 h-5 text-emerald-500"/> My Upcoming Meetings</h2>
                    
                    {myConsultations.filter(c => c.status === 'BOOKED').length === 0 ? (
                        <div className="text-center py-12 bg-emerald-50/30 rounded-2xl border-2 border-dashed border-emerald-100">
                            <p className="text-emerald-600/70 font-bold">You don't have any booked meetings.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myConsultations.filter(c => c.status === 'BOOKED').map(slot => (
                                <div key={slot.id} className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Supervisor: {slot.supervisors?.user_profiles?.name} {slot.supervisors?.user_profiles?.surname}</p>
                                            <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                                                <Calendar className="w-5 h-5 text-emerald-500" /> {new Date(slot.start_time).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 font-bold mt-1">
                                                <Clock className="w-4 h-4 text-emerald-400" /> {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <button onClick={() => handleCancel(slot.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors" title="Cancel booking">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 text-sm text-gray-700 font-medium mb-3">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Topic</span>
                                        {slot.topic}
                                    </div>
                                    {slot.meeting_link ? (
                                        <a href={slot.meeting_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors">
                                            <Video className="w-4 h-4" /> Join Virtual Meeting
                                        </a>
                                    ) : (
                                        <div className="w-full py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold flex items-center justify-center border border-gray-200">
                                            Meeting Link Pending
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
