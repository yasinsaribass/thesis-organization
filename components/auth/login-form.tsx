"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { loginSchema } from "@/schemas/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
    DEFAULT_STUDENT_LOGIN_REDIRECT,
    DEFAULT_SUPERVISOR_LOGIN_REDIRECT,
} from "@/lib/routes";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> { }

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ className, ...props }: LoginFormProps) {
    const searchParams = useSearchParams();
    const next = searchParams.get("next");
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: LoginValues) {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();

        try {
            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (signInError) throw signInError;
            if (!authData.user) throw new Error("Authentication failed");

            // Fetch role from profile to determine redirect
            const { data: profile, error: profileError } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", authData.user.id)
                .single();

            if (profileError) throw profileError;

            const role = profile?.role;

            const redirectUrl = next
                ? decodeURIComponent(next)
                : role === "STUDENT"
                    ? DEFAULT_STUDENT_LOGIN_REDIRECT
                    : DEFAULT_SUPERVISOR_LOGIN_REDIRECT;

            window.location.assign(redirectUrl);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please check your credentials.");
            setIsLoading(false);
        }
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            placeholder="Enter your email"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            placeholder="Enter your password"
                            type="password"
                            autoComplete="current-password"
                            disabled={isLoading}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Login
                    </Button>
                </div>
            </form>
        </div>
    );
}
