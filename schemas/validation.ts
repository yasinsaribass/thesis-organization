import { z } from "zod";

// --- Auth Schemas ---
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    surname: z.string().min(2, "Surname must be at least 2 characters"),
    role: z.enum(["STUDENT", "SUPERVISOR"]),
});

// --- User Profiles ---
export const userProfileSchema = z.object({
    name: z.string().min(2).nullable(),
    surname: z.string().min(2).nullable(),
    role: z.enum(["STUDENT", "SUPERVISOR"]).nullable(),
    phone_number: z.string().nullable().optional(),
    avatar_url: z.string().nullable().optional(),
});

export const updateUserProfileSchema = userProfileSchema.partial();

// --- Students ---
export const studentSchema = z.object({
    student_number: z.string().min(1, "Student number is required").nullable(),
    department: z.string().min(2, "Department is required").nullable(),
    supervisor_id: z.string().uuid().nullable().optional(),
});

export const updateStudentSchema = studentSchema.partial();

// --- Supervisors ---
export const supervisorSchema = z.object({
    academic_title: z.string().nullable().optional(),
    department: z.string().nullable().optional(),
    capacity: z.coerce.number().int().nonnegative().default(10).nullable().optional(),
    expertise_areas: z.array(z.string()).default([]).nullable().optional(),
});

export const updateSupervisorSchema = supervisorSchema.partial();

// --- Theses ---
export const thesisSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().nullable().optional(),
    status: z.enum(["DRAFT", "PROPOSAL", "IN_PROGRESS", "REVIEW", "COMPLETED"]).default("PROPOSAL"),
    start_date: z.string().nullable().optional(), // ISO date
    end_date: z.string().nullable().optional(), // ISO date
    student_id: z.string().uuid(),
});

export const updateThesisSchema = thesisSchema.partial();

// --- Tasks ---
export const taskSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().nullable().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
    thesis_id: z.string().uuid(),
    due_date: z.string().nullable().optional(), // ISO date
    parent_task_id: z.string().uuid().nullable().optional(),
});

export const updateTaskSchema = taskSchema.partial();

// --- Notifications ---
export const notificationSchema = z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    type: z.enum(["TASK_ASSIGNED", "TASK_COMPLETED", "FEEDBACK_RECEIVED", "DEADLINE_APPROACHING"]),
    user_id: z.string().uuid(),
    is_read: z.boolean().default(false),
});
