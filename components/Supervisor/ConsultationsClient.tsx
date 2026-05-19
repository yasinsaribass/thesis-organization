"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, Clock, Video, User } from "lucide-react";
import { addAvailability, cancelConsultation } from "@/server/consultations.server";
import { useLanguage } from "@/context/LanguageContext";

export function ConsultationsClient({ supervisorId, initialConsultations }: { supervisorId: string, initialConsultations: any[] }) {
    const { t } = useLanguage();
    const [consultations, setConsultations] = useState(initialConsultations);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form state
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [meetingLink, setMeetingLink] = useState("");

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const start = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);
        
        const result = await addAvailability(supervisorId, start, end, meetingLink || null);
        if (result.error) {
            alert(result.error);
        } else if (result.data) {
            setConsultations([...consultations, result.data]);
            setIsAdding(false);
            setDate(""); setStartTime(""); setEndTime(""); setMeetingLink("");
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this slot?")) return;
        
        const result = await cancelConsultation(id, "supervisor");
        if (result.error) {
            alert(result.error);
        } else {
            setConsultations(prev => prev.map(c => 
                c.id === id ? { ...c, status: c.status === 'AVAILABLE' ? 'CANCELLED' : 'CANCELLED' } : c
            ).filter(c => c.status !== 'CANCELLED' || c.student_id)); // remove unbooked cancelled slots from view
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#030213]">My Consultations</h1>
                    <p className="text-gray-500 font-medium mt-2">Manage your availability and upcoming meetings</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-5 h-5" />
                    Add Time Slot
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-4">Add New Availability</h2>
                    <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Date</label>
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Start Time</label>
                            <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">End Time</label>
                            <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Meeting Link (Optional)</label>
                            <input type="url" placeholder="https://zoom.us/j/..." value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="lg:col-span-4 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700">Save Slot</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
                    <h2 className="text-xl font-black mb-6 text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500"/> Available Slots</h2>
                    <div className="space-y-3">
                        {consultations.filter(c => c.status === 'AVAILABLE').length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-10 font-medium">No available slots. Add some to let students book!</p>
                        ) : (
                            consultations.filter(c => c.status === 'AVAILABLE').map(slot => (
                                <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-indigo-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 font-black text-lg">
                                            {new Date(slot.start_time).getDate()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{new Date(slot.start_time).toLocaleDateString('en-US', { month: 'short', weekday: 'short' })}</p>
                                            <p className="text-sm font-medium text-gray-500">
                                                {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleCancel(slot.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
                    <h2 className="text-xl font-black mb-6 text-gray-900 flex items-center gap-2"><User className="w-5 h-5 text-emerald-500"/> Booked Meetings</h2>
                    <div className="space-y-3">
                        {consultations.filter(c => c.status === 'BOOKED').length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-10 font-medium">No students have booked meetings yet.</p>
                        ) : (
                            consultations.filter(c => c.status === 'BOOKED').map(slot => (
                                <div key={slot.id} className="flex flex-col gap-3 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                                                {slot.students?.user_profiles?.name?.[0]}{slot.students?.user_profiles?.surname?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{slot.students?.user_profiles?.name} {slot.students?.user_profiles?.surname}</p>
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mt-1">
                                                    <Calendar className="w-3 h-3" /> {new Date(slot.start_time).toLocaleDateString()}
                                                    <Clock className="w-3 h-3 ml-2" /> {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleCancel(slot.id)} className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 bg-white rounded-md shadow-sm border border-red-100">Cancel</button>
                                    </div>
                                    {slot.topic && (
                                        <div className="bg-white p-3 rounded-xl border border-emerald-50 text-sm text-gray-700 font-medium">
                                            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block mb-1">Topic</span>
                                            {slot.topic}
                                        </div>
                                    )}
                                    {slot.meeting_link && (
                                        <a href={slot.meeting_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors">
                                            <Video className="w-4 h-4" /> Join Meeting
                                        </a>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
