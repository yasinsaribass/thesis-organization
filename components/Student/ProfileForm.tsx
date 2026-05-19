"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { updateStudentProfile } from "@/server/profile.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const profileFormSchema = z.object({
    name: z.string().min(2, "Name is required"),
    surname: z.string().min(2, "Surname is required"),
    phone_number: z.string().optional(),
    student_number: z.string().min(1, "Student number is required"),
    department: z.string().min(2, "Department is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
    initialData: {
        name: string;
        surname: string;
        phone_number: string;
        student_number: string;
        department: string;
        email: string;
    };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: initialData.name,
            surname: initialData.surname,
            phone_number: initialData.phone_number,
            student_number: initialData.student_number,
            department: initialData.department,
        },
    });

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await updateStudentProfile(data);
            if (res.error) {
                setError(res.error);
            } else if (res.success) {
                setSuccess("Profile updated successfully");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-sm border-indigo-100">
            <CardHeader className="bg-indigo-50/50 border-b border-indigo-100/50 pb-6 rounded-t-xl">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-white shrink-0 rounded-full border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <UserIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Personal Information</CardTitle>
                        <CardDescription className="text-indigo-900/60 mt-1">
                            Review and update your profile details. This information is shared with your supervisor.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6 pt-6">
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm font-medium">
                            {success}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">First Name</Label>
                            <Input
                                id="name"
                                {...register("name")}
                                className="focus:ring-indigo-500"
                            />
                            {errors.name && <p className="text-sm text-rose-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="surname">Last Name</Label>
                            <Input
                                id="surname"
                                {...register("surname")}
                                className="focus:ring-indigo-500"
                            />
                            {errors.surname && <p className="text-sm text-rose-500">{errors.surname.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address <span className="text-muted-foreground font-normal">(Read-only)</span></Label>
                            <Input
                                id="email"
                                value={initialData.email}
                                disabled
                                className="bg-slate-50 text-slate-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                            <Input
                                id="phone_number"
                                {...register("phone_number")}
                                placeholder="+371 2X XXX XXX"
                                className="focus:ring-indigo-500"
                            />
                            {errors.phone_number && <p className="text-sm text-rose-500">{errors.phone_number.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="student_number">Student ID / Number</Label>
                            <Input
                                id="student_number"
                                {...register("student_number")}
                                className="focus:ring-indigo-500"
                            />
                            {errors.student_number && <p className="text-sm text-rose-500">{errors.student_number.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Department / Faculty</Label>
                            <Input
                                id="department"
                                {...register("department")}
                                className="focus:ring-indigo-500"
                            />
                            {errors.department && <p className="text-sm text-rose-500">{errors.department.message}</p>}
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl py-4">
                    <Button
                        type="submit"
                        disabled={isLoading || !isDirty}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
