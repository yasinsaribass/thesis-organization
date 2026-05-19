"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateStudentSchema, updateSupervisorSchema } from "@/schemas/validation";
import { createStudentProfile } from "@/server/student.server";
import { createSupervisorProfile } from "@/server/supervisor.server";
import { FACULTIES, FacultyName } from "@/lib/constants/faculties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface ProfileSetupFormProps {
    role: "STUDENT" | "SUPERVISOR";
}

import { useLanguage } from "@/context/LanguageContext";

export function ProfileSetupForm({ role }: ProfileSetupFormProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expertiseInput, setExpertiseInput] = useState("");
    const [expertiseAreas, setExpertiseAreas] = useState<string[]>([]);
    
    // State for cascading dropdowns
    const [selectedFaculty, setSelectedFaculty] = useState<FacultyName | "">("");

    // Mapping for faculty and department translations
    const facultyTranslations: Record<string, string> = {
        "Faculty of Civil and Mechanical Engineering": t.faculties.list.civil,
        "Faculty of Natural Sciences and Technology": t.faculties.list.natural,
        "Faculty of Computer Science, Information Technology and Energy": t.faculties.list.computer,
        "Faculty of Engineering Economics and Management": t.faculties.list.economy,
    };

    const departmentTranslations: Record<string, string> = {
        "Civil Engineering": t.faculties.departments.civilEng,
        "Mechanics and Mechanical Engineering": t.faculties.departments.mechanics,
        "Engineering Technology": t.faculties.departments.engTech,
        "Aviation Transport": t.faculties.departments.aviation,
        "Medical Engineering and Medical Physics": t.faculties.departments.medical,
        "Environmental Engineering": t.faculties.departments.envEng,
        "Materials Engineering": t.faculties.departments.matEng,
        "Computer Systems": t.faculties.departments.compSys,
        "Telecommunication technologies and data transmission engineering": t.faculties.departments.telecom,
        "Finance management information systems": t.faculties.departments.finance,
        "Smart Electronic Systems": t.faculties.departments.smart,
        "Entrepreneurship and Management": t.faculties.departments.business,
    };

    const academicTitles: Record<string, string> = {
        "Professor": t.setup.academicTitles.professor,
        "Associate Professor": t.setup.academicTitles.associate,
        "Assistant Professor": t.setup.academicTitles.assistant,
        "Dr.": t.setup.academicTitles.dr,
    };

    // Dynamic schema validation based on role
    const schema = role === "STUDENT" ? updateStudentSchema : updateSupervisorSchema;

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: role === "STUDENT"
            ? { student_number: "", department: "" }
            : { academic_title: "", department: "", expertise_areas: [], capacity: 10 },
    });

    const handleAddExpertise = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = expertiseInput.trim();
            if (val && !expertiseAreas.includes(val)) {
                const newAreas = [...expertiseAreas, val];
                setExpertiseAreas(newAreas);
                form.setValue("expertise_areas", newAreas, { shouldValidate: true });
            }
            setExpertiseInput("");
        }
    };

    const handleRemoveExpertise = (areaToRemove: string) => {
        const newAreas = expertiseAreas.filter((area) => area !== areaToRemove);
        setExpertiseAreas(newAreas);
        form.setValue("expertise_areas", newAreas, { shouldValidate: true });
    };

    const onSubmit = async (values: any) => {
        setIsLoading(true);
        setError(null);

        try {
            let result;
            if (role === "STUDENT") {
                result = await createStudentProfile(values);
            } else {
                const payload = { ...values, expertise_areas: expertiseAreas, capacity: 10 };
                result = await createSupervisorProfile(payload);
            }

            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            // On success, forcefully reset the UI state to escape the layout cache
            window.location.assign("/dashboard");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-white border border-gray-100 shadow-sm rounded-xl p-2">
            <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight">
                    {t.setup.profileSetup.replace("{role}", role === "STUDENT" ? t.nav.student || "Student" : t.nav.supervisor || "Supervisor")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* STUDENT FIELDS */}
                    {role === "STUDENT" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="student_number">{t.setup.studentId}</Label>
                                <Input
                                    id="student_number"
                                    placeholder={t.setup.studentIdPlaceholder}
                                    {...form.register("student_number")}
                                    className="bg-white border border-gray-200 focus-visible:ring-1"
                                />
                                {typeof (form.formState.errors as any).student_number?.message === "string" && (
                                    <p className="text-sm font-medium text-destructive">
                                        {(form.formState.errors as any).student_number?.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="faculty">{t.faculties.title}</Label>
                                <div className="relative">
                                    <select
                                        id="faculty"
                                        value={selectedFaculty}
                                        onChange={(e) => {
                                            setSelectedFaculty(e.target.value as FacultyName);
                                            form.setValue("department", "");
                                        }}
                                        className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring appearance-none h-10"
                                    >
                                        <option value="">{t.faculties.select}</option>
                                        {Object.keys(FACULTIES).map((faculty) => (
                                            <option key={faculty} value={faculty}>{facultyTranslations[faculty] || faculty}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">{t.faculties.department}</Label>
                                <div className="relative">
                                    <select
                                        id="department"
                                        disabled={!selectedFaculty}
                                        {...form.register("department")}
                                        className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none h-10"
                                    >
                                        <option value="">{t.faculties.selectDept}</option>
                                        {selectedFaculty && FACULTIES[selectedFaculty as FacultyName].map((dept) => (
                                            <option key={dept} value={dept}>{departmentTranslations[dept] || dept}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                {typeof (form.formState.errors as any).department?.message === "string" && (
                                    <p className="text-sm font-medium text-destructive">
                                        {(form.formState.errors as any).department?.message}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* SUPERVISOR FIELDS */}
                    {role === "SUPERVISOR" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="academic_title">{t.setup.academicTitle}</Label>
                                <div className="relative">
                                    <select
                                        id="academic_title"
                                        {...form.register("academic_title")}
                                        className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none h-10"
                                    >
                                        <option value="">{t.setup.academicTitlePlaceholder}</option>
                                        {Object.entries(academicTitles).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                {typeof (form.formState.errors as any).academic_title?.message === "string" && (
                                    <p className="text-sm font-medium text-destructive">
                                        {(form.formState.errors as any).academic_title?.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="faculty">{t.faculties.title}</Label>
                                <div className="relative">
                                    <select
                                        id="faculty"
                                        value={selectedFaculty}
                                        onChange={(e) => {
                                            setSelectedFaculty(e.target.value as FacultyName);
                                            form.setValue("department", "");
                                        }}
                                        className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring appearance-none h-10"
                                    >
                                        <option value="">{t.faculties.select}</option>
                                        {Object.keys(FACULTIES).map((faculty) => (
                                            <option key={faculty} value={faculty}>{facultyTranslations[faculty] || faculty}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">{t.faculties.department}</Label>
                                <div className="relative">
                                    <select
                                        id="department"
                                        disabled={!selectedFaculty}
                                        {...form.register("department")}
                                        className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none h-10"
                                    >
                                        <option value="">{t.faculties.selectDept}</option>
                                        {selectedFaculty && FACULTIES[selectedFaculty as FacultyName].map((dept) => (
                                            <option key={dept} value={dept}>{departmentTranslations[dept] || dept}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                {typeof (form.formState.errors as any).department?.message === "string" && (
                                    <p className="text-sm font-medium text-destructive">
                                        {(form.formState.errors as any).department?.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>{t.setup.expertiseArea}</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {expertiseAreas.map((area, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 rounded bg-[#f1f5f9] px-2 py-1 text-xs font-medium text-slate-800"
                                        >
                                            {area}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExpertise(area)}
                                                className="text-slate-500 hover:text-slate-700"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <Input
                                    type="text"
                                    placeholder={t.setup.expertisePlaceholder}
                                    value={expertiseInput}
                                    onChange={(e) => setExpertiseInput(e.target.value)}
                                    onKeyDown={handleAddExpertise}
                                    className="bg-white border border-gray-200 focus-visible:ring-1"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    {t.setup.expertiseHint}
                                </p>
                                {typeof (form.formState.errors as any).expertise_areas?.message === "string" && (
                                    <p className="text-sm font-medium text-destructive mt-1">
                                        {(form.formState.errors as any).expertise_areas?.message}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20 mt-4">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#030213] text-white hover:bg-[#030213]/90 mt-6"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t.setup.saving}
                            </>
                        ) : (
                            t.setup.completeSetup
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
