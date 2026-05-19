"use client";

import * as React from "react";
import { GraduationCap, UserCog, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RoleSelectionProps {
    selectedRole: "STUDENT" | "SUPERVISOR" | null;
    onSelectRole: (role: "STUDENT" | "SUPERVISOR") => void;
}

export function RoleSelection({ selectedRole, onSelectRole }: RoleSelectionProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card
                className={cn(
                    "cursor-pointer p-4 transition-all hover:border-primary hover:bg-accent/50",
                    selectedRole === "STUDENT" && "border-primary bg-accent ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => onSelectRole("STUDENT")}
            >
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-full bg-background p-3 shadow-sm ring-1 ring-border">
                        <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium leading-none">Student</p>
                        <p className="text-xs text-muted-foreground">Manage your thesis</p>
                    </div>
                </div>
            </Card>

            <Card
                className={cn(
                    "cursor-pointer p-4 transition-all hover:border-primary hover:bg-accent/50",
                    selectedRole === "SUPERVISOR" && "border-primary bg-accent ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => onSelectRole("SUPERVISOR")}
            >
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-full bg-background p-3 shadow-sm ring-1 ring-border">
                        <UserCog className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium leading-none">Supervisor</p>
                        <p className="text-xs text-muted-foreground">Guide students</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
