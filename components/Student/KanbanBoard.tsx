"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { MoreHorizontal, Clock, CheckCircle2, Plus, AlertCircle, Ghost, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { updateTaskStatus, deleteTask } from "@/server/tasks.server";
import { InlineTaskForm } from "./InlineTaskForm";
import { CinematicSuccess } from "./CinematicSuccess";
import { CinematicDragonDefeat } from "./CinematicDragonDefeat";


interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    priority: string | null;
    due_date: string | null;
}

interface KanbanBoardProps {
    initialSubtasks: Task[];
    taskId: string;
    isLastGlobalTask?: boolean;
    thesisId?: string;
}

const COLUMNS = [
    { id: "TODO", title: "To Do", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600" },
    { id: "IN_PROGRESS", title: "In Progress", bg: "bg-indigo-50/40", border: "border-indigo-100", text: "text-indigo-600" },
    { id: "DONE", title: "Done", bg: "bg-emerald-50/50", border: "border-emerald-100", text: "text-emerald-600" }
];

export function KanbanBoard({ initialSubtasks, taskId, isLastGlobalTask, thesisId }: KanbanBoardProps) {
    const [subtasks, setSubtasks] = useState<Task[]>(initialSubtasks);
    const [isReady, setIsReady] = useState(false);
    const [isCreatingTask, setIsCreatingTask] = useState(false);

    // Subtask delete state
    const [deletingSubtask, setDeletingSubtask] = useState<Task | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCinematic, setShowCinematic] = useState(false);
    const [showDragonDefeat, setShowDragonDefeat] = useState(false);


    useEffect(() => {
        setIsReady(true);
    }, []);

    if (!isReady) return null;

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const updatedSubtasks = Array.from(subtasks);
        const taskIndex = updatedSubtasks.findIndex(s => s.id === draggableId);

        if (taskIndex !== -1) {
            const task = updatedSubtasks[taskIndex];
            task.status = destination.droppableId;
            setSubtasks(updatedSubtasks);

            if (destination.droppableId === 'DONE') {
                import("canvas-confetti").then((confetti) => {
                    confetti.default({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'] // match app colors
                    });
                });
            }

            // Check if ALL subtasks are now DONE
            const allDone = updatedSubtasks.every(s => s.status === 'DONE');
            if (allDone && destination.droppableId === 'DONE') {
                // Short delay to let the card drop animation finish
                setTimeout(() => {
                    if (isLastGlobalTask) {
                        setShowDragonDefeat(true);
                        // Mark as seen so dashboard doesn't show it again
                        if (thesisId) {
                            localStorage.setItem(`dragon_defeat_seen_${thesisId}`, "true");
                        }
                    } else {
                        setShowCinematic(true);
                    }
                }, 800);
            }


            const res = await updateTaskStatus(draggableId, destination.droppableId);
            if (res.error) {
                setSubtasks(initialSubtasks);
                alert("Failed to update status: " + res.error);
            }
        }
    };

    const handleCreateTaskSuccess = (newTask: Task) => {
        setSubtasks(prev => [...prev, newTask]);
        setIsCreatingTask(false);
    };

    const handleDeleteSubtask = async () => {
        if (!deletingSubtask) return;
        setIsDeleting(true);
        const result = await deleteTask(deletingSubtask.id);
        if (result.error) {
            alert("Error: " + result.error);
        } else {
            setSubtasks(prev => prev.filter(s => s.id !== deletingSubtask.id));
        }
        setIsDeleting(false);
        setDeletingSubtask(null);
    };

    const getDateDisplay = (subtask: Task, columnId: string) => {
        if (columnId === "DONE") {
            return (
                <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-gray-400">{subtask.due_date ? new Date(subtask.due_date).toLocaleDateString("tr-TR") : "No Date"}</span>
                </>
            );
        }

        if (!subtask.due_date) {
            return (
                <>
                    <Clock className="w-3.5 h-3.5 text-blue-400/50" />
                    <span className="text-gray-400">No Date</span>
                </>
            );
        }

        const dueDate = new Date(subtask.due_date);
        const daysDiff = (dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);

        if (daysDiff < 0) {
            return (
                <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-600">Overdue</span>
                </>
            );
        } else if (daysDiff <= 1) {
            return (
                <>
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-600">Due Soon</span>
                </>
            );
        }

        return (
            <>
                <Clock className="w-3.5 h-3.5 text-blue-400/50" />
                <span className="text-gray-400">{dueDate.toLocaleDateString("tr-TR")}</span>
            </>
        );
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-10">
                    {COLUMNS.map((column) => (
                        <div key={column.id} className={`flex flex-col rounded-3xl border ${column.border} ${column.bg} overflow-hidden shadow-sm`}>
                            {/* Column Header */}
                            <div className="px-6 py-5 flex items-center justify-between border-b border-inherit bg-white/40 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <h2 className={`font-black ${column.text} text-xs uppercase tracking-widest`}>{column.title}</h2>
                                    <span className="bg-white border border-inherit px-2.5 py-0.5 rounded-full text-[10px] font-black text-gray-400">
                                        {subtasks.filter(s => (s.status || "TODO") === column.id).length}
                                    </span>
                                </div>
                                <button className="p-1.5 hover:bg-white rounded-xl transition-all text-gray-400">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Droppable Area */}
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 p-4 flex flex-col gap-4 overflow-y-auto min-h-[500px] transition-colors duration-200 ${snapshot.isDraggingOver ? "bg-white/20" : ""}`}
                                    >
                                        {subtasks
                                            .filter(s => (s.status || "TODO") === column.id)
                                            .map((subtask, index) => (
                                                <Draggable key={subtask.id} draggableId={subtask.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all group/card ${snapshot.isDragging
                                                                ? "shadow-2xl border-indigo-200 ring-4 ring-indigo-50/50 scale-105 z-50"
                                                                : "hover:shadow-md hover:border-gray-200 active:scale-95"
                                                                }`}
                                                        >
                                                            {/* Card Header with title + delete button */}
                                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                                <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">
                                                                    {subtask.title}
                                                                </h3>
                                                                {/* Delete button – appears on card hover */}
                                                                <button
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDeletingSubtask(subtask);
                                                                    }}
                                                                    className="opacity-0 group-hover/card:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                                                                    title="Delete this subtask"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>

                                                            {subtask.description && (
                                                                <p className="text-gray-400 text-[11px] line-clamp-2 mb-4 leading-relaxed font-medium">
                                                                    {subtask.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter">
                                                                    {getDateDisplay(subtask, column.id)}
                                                                </div>
                                                                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black ${subtask.priority === "HIGH" ? "bg-red-50 text-red-500" :
                                                                    subtask.priority === "URGENT" ? "bg-rose-50 text-rose-600" :
                                                                        subtask.priority === "MEDIUM" ? "bg-amber-50 text-amber-500" :
                                                                            "bg-blue-50 text-blue-500"
                                                                    }`}>
                                                                    {subtask.priority || "MEDIUM"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}

                                        {subtasks.filter(s => (s.status || "TODO") === column.id).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                                <Ghost className="w-12 h-12 mb-3 text-slate-400" strokeWidth={1.5} />
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Nothing here yet</p>
                                            </div>
                                        )}

                                        {provided.placeholder}

                                        {column.id === "TODO" && (
                                            isCreatingTask ? (
                                                <InlineTaskForm
                                                    taskId={taskId}
                                                    onCancel={() => setIsCreatingTask(false)}
                                                    onSuccess={handleCreateTaskSuccess}
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => setIsCreatingTask(true)}
                                                    className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-[11px] font-black uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 hover:bg-white transition-all flex items-center justify-center gap-2 group mt-2"
                                                >
                                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                                    Add New Step
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {/* Subtask Delete Confirmation Modal */}
            {deletingSubtask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-1">Delete Subtask?</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    <span className="font-bold text-gray-700">"{deletingSubtask.title}"</span> will be permanently deleted. This cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full pt-2">
                                <button
                                    onClick={() => setDeletingSubtask(null)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-2xl border border-gray-100 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteSubtask}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCinematic && (
                <CinematicSuccess 
                    videoUrl="/task-completed.mp4"
                    onComplete={() => {
                        setShowCinematic(false);
                    }}
                />
            )}

            {showDragonDefeat && (
                <CinematicDragonDefeat 
                    onComplete={() => {
                        setShowDragonDefeat(false);
                    }}
                />
            )}


        </>

    );
}
