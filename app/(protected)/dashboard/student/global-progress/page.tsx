import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { getAllThesisTasks } from "@/server/tasks.server";
import { redirect } from "next/navigation";
import { format, differenceInDays, parseISO, eachDayOfInterval, getWeek, startOfWeek, endOfWeek } from "date-fns";
import React from "react";

export default async function GlobalProgressPage() {
    const result = await getAllThesisTasks();

    if ("error" in result) {
        if (result.error === "Not authenticated") {
            redirect("/auth/login");
        }
        return (
            <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Notice</h2>
                    <p className="text-gray-500 mb-6">{result.error}</p>
                    <Link href="/dashboard/student" className="text-indigo-600 font-medium hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const { thesis, tasks } = result as {
        thesis: { id: string; title: string };
        tasks: any[];
    };

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
            color: taskSubtasks.every(s => s.status === "DONE") && mainTask.status === "DONE" ? "bg-emerald-500" : "bg-[#f8654c]" // monday.com orange-red color scheme
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
                label: `Week ${getWeek(day)} ${format(wStart, "MMM d")} - ${format(wEnd, "MMM d")}`,
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
        <div className="min-h-screen bg-[#f5f5f7] pb-20 overflow-x-hidden">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-4">
                    <Link 
                        href="/dashboard/student" 
                        className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500 shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Project Board</h1>
                        <p className="text-sm text-gray-500">{thesis.title}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-8">
                <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 overflow-hidden flex flex-col h-[75vh] min-h-[600px]">

                    {/* Native CSS Grid/Flex Synchronized Scroll Area */}
                    <div className="flex-1 overflow-auto relative">
                        <div className="flex flex-col min-w-max w-full">
                             
                             {/* The Header Row - Sticky Top */}
                             <div className="flex sticky top-0 z-30 bg-white border-b border-gray-200 text-gray-700" style={{ width: `calc(320px + ${days.length * DAY_WIDTH}px)` }}>
                                  
                                  {/* Left Panel Corner (Sticky Top & Left) */}
                                  <div className="w-[320px] flex-shrink-0 sticky left-0 z-40 bg-white border-r border-gray-200 flex items-center px-4 font-semibold text-sm">
                                       Task Name
                                  </div>
                                  
                                  {/* Right Timeline Header wrapper */}
                                  <div className="flex flex-col flex-1">
                                      {/* Weeks row */}
                                      <div className="flex-1 flex border-b border-gray-100">
                                          {weeks.map(week => (
                                              <div key={week.id} className="border-r border-gray-200 flex items-center justify-center text-[10px] sm:text-[11px] font-semibold text-gray-700 bg-white/50" style={{ width: `${week.daysCount * DAY_WIDTH}px` }}>
                                                  {week.label}
                                              </div>
                                          ))}
                                      </div>
                                      {/* Days row */}
                                      <div className="h-6 flex">
                                          {days.map(day => (
                                              <div key={day.getTime()} className="border-r border-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-medium bg-gray-50/70" style={{ width: `${DAY_WIDTH}px` }}>
                                                  {format(day, "d")}
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                             </div>

                             {/* Chart Body block underneath headers */}
                             <div className="relative" style={{ width: `calc(320px + ${days.length * DAY_WIDTH}px)` }}>
                                 
                                 {/* Transparent timeline grid backdrop matching vertical borders day by day */}
                                 <div className="absolute inset-y-0 left-[320px] right-0 flex pointer-events-none z-0">
                                      {days.map(day => (
                                          <div key={`grid-${day.getTime()}`} className="border-r border-gray-100/60 h-full" style={{ width: `${DAY_WIDTH}px` }}></div>
                                      ))}
                                 </div>

                                 {/* Data Content Loops */}
                                 {processedMainTasks.map(main => (
                                     <React.Fragment key={main.id}>
                                         
                                         {/* --------- MAIN TASK ROW --------- */}
                                         <div className="flex w-full h-12 border-b border-gray-100 group relative z-10 hover:bg-gray-50/50">
                                             <div className="w-[320px] sticky left-0 z-20 bg-white border-r border-gray-200 flex items-center px-4 group-hover:bg-gray-50/80 transition-colors shrink-0">
                                                 <span className={`w-3 h-3 rounded-full ${main.color} mr-3 shadow-inner`}></span>
                                                 <span className="font-bold text-gray-900 text-sm truncate">{main.title}</span>
                                             </div>
                                             <div className="flex-1 relative bg-transparent pointer-events-auto">
                                                 {/* Visual thin umbrella span */}
                                                 <div 
                                                     className={`absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-gray-500 opacity-60`}
                                                     style={{ left: `${getOffset(main.startDate)}px`, width: `${getWidth(main.startDate, main.endDate)}px` }}
                                                 ></div>
                                                 {/* Label to the right of overall bounds */}
                                                 <div 
                                                     className="absolute whitespace-nowrap text-xs text-gray-700 font-semibold top-1/2 -translate-y-1/2"
                                                     style={{ left: `${getOffset(main.startDate) + getWidth(main.startDate, main.endDate) + 12}px` }}
                                                 >
                                                     {main.title}
                                                 </div>
                                             </div>
                                         </div>

                                         {/* --------- SUBTASK ROWS --------- */}
                                         {main.subtasks.map((sub: any) => {
                                             const statusColor = sub.status === "DONE" ? "bg-emerald-500" : "bg-[#f8654c]";
                                             
                                             return (
                                                 <div key={sub.id} className="flex w-full h-10 border-b border-gray-100/60 group relative z-10 hover:bg-gray-50/50">
                                                     
                                                     <div className="w-[320px] sticky left-0 z-20 bg-white border-r border-gray-200 flex items-center px-4 shrink-0 justify-between group-hover:bg-gray-50/80 transition-colors">
                                                         <div className="pl-6 w-48 text-sm text-gray-600 truncate">{sub.title}</div>
                                                         <div className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded">{format(sub.startDate, "MMM d")} - {format(sub.endDate, "MMM d")}</div>
                                                     </div>
                                                     
                                                     <div className="flex-1 relative bg-transparent pointer-events-none">
                                                         
                                                         {/* Faint dot line string connecting left panel to start date box */}
                                                         <div className="absolute h-px border-b border-dashed border-gray-300 top-1/2 -translate-y-1/2" style={{ left: 0, width: `${getOffset(sub.startDate)}px` }}></div>

                                                         {/* Colorful task segment */}
                                                         <div 
                                                             className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-[4px] hover:brightness-110 shadow-sm opacity-95 cursor-pointer pointer-events-auto flex items-center z-10 ${statusColor}`}
                                                             style={{ left: `${getOffset(sub.startDate)}px`, width: `${getWidth(sub.startDate, sub.endDate)}px` }}
                                                         >
                                                             {/* Optional tiny internal text if enough width */}
                                                             <span className="truncate text-[10px] font-medium text-white px-2">
                                                                 {sub.title}
                                                             </span>
                                                         </div>
                                                         
                                                         {/* Floating text to the right showing completion days */}
                                                         <div 
                                                             className="absolute whitespace-nowrap text-[11px] text-gray-500 font-medium top-1/2 -translate-y-1/2 pr-4 z-0"
                                                             style={{ left: `${getOffset(sub.startDate) + getWidth(sub.startDate, sub.endDate) + 8}px` }}
                                                         >
                                                             {sub.title} • {sub.duration} days
                                                         </div>
                                                     </div>
                                                 </div>
                                             );
                                         })}
                                     </React.Fragment>
                                 ))}

                                 {/* Filler height to allow smooth scroll down feeling natively */}
                                 <div className="h-16 flex w-full relative z-0">
                                    <div className="w-[320px] sticky left-0 z-20 bg-white border-r border-gray-200 shrink-0 h-full"></div>
                                 </div>
                             </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
