"use client";

import React from "react";
import { format, differenceInDays, parseISO, eachDayOfInterval, getWeek, startOfWeek, endOfWeek } from "date-fns";

interface GanttChartProps {
    thesis: { id: string; title: string };
    tasks: any[];
}

import { useLanguage } from "@/context/LanguageContext";
import { lv, enUS } from "date-fns/locale";

export function GanttChart({ thesis, tasks }: GanttChartProps) {
    const { t, language } = useLanguage();
    const currentLocale = language === "LV" ? lv : enUS;
    const mainTasks = tasks.filter(t => !t.parent_task_id);
    const subtasks = tasks.filter(t => t.parent_task_id);

    // Calculate dates locally based on subtask bounds.
    const getTaskBounds = (t: any) => {
        const start = parseISO(t.created_at);
        let end = t.due_date ? parseISO(t.due_date) : 
            (t.status === "DONE" && t.completed_at ? parseISO(t.completed_at) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000));
        
        if (end < start) end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        return { startDate: start, endDate: end, duration: differenceInDays(end, start) || 1 };
    };

    // Organize subtasks under their respective parent and determine the parent's overall wrap dates bounds
    const processedMainTasks = mainTasks.map(mainTask => {
        const taskSubtasks = subtasks.filter(s => s.parent_task_id === mainTask.id).map(s => ({
            ...s,
            ...getTaskBounds(s)
        })).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        let { startDate, endDate, duration } = getTaskBounds(mainTask);
        if (taskSubtasks.length > 0) {
           startDate = new Date(Math.min(startDate.getTime(), ...taskSubtasks.map(s => s.startDate.getTime())));
           endDate = new Date(Math.max(endDate.getTime(), ...taskSubtasks.map(s => s.endDate.getTime())));
           duration = differenceInDays(endDate, startDate) || 1;
        }
        
        return {
            ...mainTask,
            subtasks: taskSubtasks,
            startDate,
            endDate,
            duration,
            color: taskSubtasks.every(s => s.status === "DONE") && mainTask.status === "DONE" ? "bg-emerald-500" : "bg-indigo-500"
        };
    }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Generate Gantt chart days column 
    const timelineStartRaw = processedMainTasks.length > 0 ? new Date(Math.min(...processedMainTasks.map(t => t.startDate.getTime()))) : new Date();
    const timelineEndRaw = processedMainTasks.length > 0 ? new Date(Math.max(...processedMainTasks.map(t => t.endDate.getTime()))) : new Date();
    
    // Add buffer days to visualization timeline limits
    const timelineStart = new Date(timelineStartRaw.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days start pad
    const timelineEnd = new Date(timelineEndRaw.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks end pad
    
    const days = eachDayOfInterval({ start: timelineStart, end: timelineEnd });
    
    // Cluster days into generic Weeks group
    const weeksMap = new Map();
    days.forEach(day => {
        const wStart = startOfWeek(day, { weekStartsOn: 1 });
        const wEnd = endOfWeek(day, { weekStartsOn: 1 });
        const key = `${wStart.getTime()}`;
        if (!weeksMap.has(key)) {
            weeksMap.set(key, {
                id: key,
                label: `${t.projectBoard.week} ${getWeek(day)} ${format(wStart, "MMM d", { locale: currentLocale })} - ${format(wEnd, "MMM d", { locale: currentLocale })}`,
                daysCount: 1
            });
        } else {
            weeksMap.get(key).daysCount += 1;
        }
    });
    const weeks = Array.from(weeksMap.values());
    
    const DAY_WIDTH = 30; // 30px hardcoded fixed horizontal translation step
    const getOffset = (date: Date) => Math.max(0, differenceInDays(date, timelineStart)) * DAY_WIDTH;
    const getWidth = (start: Date, end: Date) => Math.max(1, differenceInDays(end, start)) * DAY_WIDTH;

    return (
        <div className="bg-white rounded-xl overflow-hidden flex flex-col h-full border border-slate-200 shadow-inner">
            <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <div className="flex flex-col min-w-max w-full">
                     
                     {/* The Header Row - Sticky Top */}
                     <div className="flex sticky top-0 z-30 bg-white border-b border-gray-200 text-gray-700" style={{ width: `calc(320px + ${days.length * DAY_WIDTH}px)` }}>
                          <div className="w-[320px] flex-shrink-0 sticky left-0 z-40 bg-white border-r border-gray-200 flex items-center px-4 font-black uppercase tracking-widest text-[10px] text-slate-400">
                               {t.projectBoard.taskName}
                          </div>
                          <div className="flex flex-col flex-1">
                              <div className="flex-1 flex border-b border-gray-100">
                                  {weeks.map(week => (
                                      <div key={week.id} className="border-r border-gray-200 flex items-center justify-center text-[10px] font-black uppercase tracking-tighter text-slate-500 bg-slate-50/50" style={{ width: `${week.daysCount * DAY_WIDTH}px` }}>
                                          {week.label}
                                      </div>
                                  ))}
                              </div>
                              <div className="h-6 flex">
                                  {days.map(day => (
                                      <div key={day.getTime()} className="border-r border-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold bg-white" style={{ width: `${DAY_WIDTH}px` }}>
                                          {format(day, "d")}
                                      </div>
                                  ))}
                              </div>
                          </div>
                     </div>

                     {/* Chart Body */}
                     <div className="relative" style={{ width: `calc(320px + ${days.length * DAY_WIDTH}px)` }}>
                         <div className="absolute inset-y-0 left-[320px] right-0 flex pointer-events-none z-0">
                              {days.map(day => (
                                  <div key={`grid-${day.getTime()}`} className="border-r border-gray-100/60 h-full" style={{ width: `${DAY_WIDTH}px` }}></div>
                              ))}
                         </div>

                         {processedMainTasks.map(main => (
                             <React.Fragment key={main.id}>
                                 <div className="flex w-full h-12 border-b border-gray-100 group relative z-10 hover:bg-slate-50/80 transition-colors">
                                     <div className="w-[320px] sticky left-0 z-20 bg-white border-r border-gray-200 flex items-center px-4 group-hover:bg-slate-50 transition-colors shrink-0">
                                         <div className={`w-3 h-3 rounded-full ${main.color} mr-3 shadow-sm`}></div>
                                         <span className="font-black text-slate-800 text-xs uppercase tracking-tight truncate">{main.title}</span>
                                     </div>
                                     <div className="flex-1 relative bg-transparent pointer-events-auto">
                                         <div 
                                             className={`absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-slate-200`}
                                             style={{ left: `${getOffset(main.startDate)}px`, width: `${getWidth(main.startDate, main.endDate)}px` }}
                                         ></div>
                                         <div 
                                             className="absolute whitespace-nowrap text-[10px] text-slate-500 font-black uppercase tracking-widest top-1/2 -translate-y-1/2"
                                             style={{ left: `${getOffset(main.startDate) + getWidth(main.startDate, main.endDate) + 12}px` }}
                                         >
                                             {main.title}
                                         </div>
                                     </div>
                                 </div>

                                 {main.subtasks.map((sub: any) => {
                                     const statusColor = sub.status === "DONE" ? "bg-emerald-500" : "bg-indigo-400";
                                     return (
                                         <div key={sub.id} className="flex w-full h-10 border-b border-gray-100/60 group relative z-10 hover:bg-slate-50/50">
                                             <div className="w-[320px] sticky left-0 z-20 bg-white border-r border-gray-200 flex items-center px-4 shrink-0 justify-between group-hover:bg-slate-50/80 transition-colors">
                                                 <div className="pl-6 w-48 text-xs font-bold text-slate-600 truncate">{sub.title}</div>
                                                 <div className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">
                                                    {format(sub.startDate, "MMM d", { locale: currentLocale })} - {format(sub.endDate, "MMM d", { locale: currentLocale })}
                                                 </div>
                                             </div>
                                             <div className="flex-1 relative bg-transparent pointer-events-none">
                                                 <div className="absolute h-px border-b border-dashed border-slate-200 top-1/2 -translate-y-1/2" style={{ left: 0, width: `${getOffset(sub.startDate)}px` }}></div>
                                                 <div 
                                                     className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-lg hover:brightness-105 shadow-md shadow-indigo-500/10 opacity-100 cursor-pointer pointer-events-auto flex items-center z-10 ${statusColor} border border-white/20`}
                                                     style={{ left: `${getOffset(sub.startDate)}px`, width: `${getWidth(sub.startDate, sub.endDate)}px` }}
                                                 >
                                                     <span className="truncate text-[9px] font-black uppercase tracking-tighter text-white px-2">
                                                         {sub.title}
                                                     </span>
                                                 </div>
                                                 <div 
                                                     className="absolute whitespace-nowrap text-[9px] text-slate-400 font-bold top-1/2 -translate-y-1/2 pr-4 z-0"
                                                     style={{ left: `${getOffset(sub.startDate) + getWidth(sub.startDate, sub.endDate) + 8}px` }}
                                                 >
                                                     {sub.title} • {sub.duration}{t.projectBoard.daysSuffix}
                                                 </div>
                                             </div>
                                         </div>
                                     );
                                 })}
                             </React.Fragment>
                         ))}
                         <div className="h-20 flex w-full relative z-0">
                            <div className="w-[320px] sticky left-0 z-20 bg-white border-r border-gray-200 shrink-0 h-full"></div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
}
