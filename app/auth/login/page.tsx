import { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
    title: "Login | ThesisFlow",
    description: "Login to your ThesisFlow account",
};

export default function LoginPage() {
    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                href="/auth/sign-up"
                className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "absolute right-4 top-4 md:right-8 md:top-8"
                )}
            >
                Sign Up
            </Link>
            <div className="relative hidden h-full flex-col bg-slate-50 border-r border-slate-200 lg:flex items-center justify-center p-16">
                <img
                    src="https://www.rtu.lv/images/logo_en.svg"
                    alt="Riga Technical University Logo"
                    className="w-full h-full object-contain drop-shadow-sm max-w-[80%] max-h-[80%]"
                />
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Login to your account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>
                    <React.Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                        <LoginForm />
                    </React.Suspense>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking login, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
