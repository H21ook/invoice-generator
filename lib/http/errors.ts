import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
    constructor(
        public message: string,
        public code: string = "INTERNAL_ERROR",
        public status: number = 500,
        public details?: unknown
    ) {
        super(message);
        this.name = "AppError";
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, "VALIDATION_ERROR", 400, details);
        this.name = "ValidationError";
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, "NOT_FOUND", 404);
        this.name = "NotFoundError";
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, "UNAUTHORIZED", 401);
        this.name = "UnauthorizedError";
    }
}

export function handleError(error: unknown) {
    console.error("[API Error]", error);

    if (error instanceof AppError) {
        return NextResponse.json(
            {
                error: {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                },
            },
            { status: error.status }
        );
    }

    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Input validation failed",
                    details: error.errors,
                },
            },
            { status: 400 }
        );
    }

    return NextResponse.json(
        {
            error: {
                code: "INTERNAL_ERROR",
                message: "An unexpected error occurred",
            },
        },
        { status: 500 }
    );
}
