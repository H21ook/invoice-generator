import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generatePublicId, generateEditToken, hashToken } from "@/lib/tokens";
import { calculateTotals } from "@/lib/totals";
import { handleError, ValidationError } from "@/lib/http/errors";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const CreateInvoiceSchema = z.object({
    currency: z.string().length(3).default("USD"),
    locale: z.string().default("en-US"),
    issuer: z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        taxId: z.string().optional(),
    }),
    customer: z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
    }),
    items: z.array(
        z.object({
            description: z.string().min(1),
            qty: z.number().positive(),
            unitPrice: z.number().nonnegative(),
            taxRate: z.number().min(0).max(100).optional(),
            discount: z.number().min(0).max(100).optional(),
        })
    ).min(1),
    notes: z.string().optional(),
    terms: z.string().optional(),
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        // 1. Rate Limiting
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const limiter = await rateLimit(ip);
        if (!limiter.success) {
            return NextResponse.json(
                { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" } },
                { status: 429 }
            );
        }

        // 2. Validation
        const body = await req.json();
        const result = CreateInvoiceSchema.safeParse(body);
        if (!result.success) {
            throw new ValidationError("Invalid invoice data", result.error.errors);
        }

        const data = result.data;
        const totals = calculateTotals(data.items);

        // 3. Tokens
        const publicId = generatePublicId();
        const editToken = generateEditToken();
        const editTokenHash = hashToken(editToken);

        // 4. DB Insert
        const supabaseAdmin = getSupabaseAdmin();
        const { error: dbError } = await (supabaseAdmin as any).from("invoices").insert({
            public_id: publicId,
            edit_token_hash: editTokenHash,
            status: "draft",
            currency: data.currency,
            locale: data.locale,
            issuer: data.issuer,
            customer: data.customer,
            items: data.items,
            totals: totals,
            notes: data.notes,
            terms: data.terms,
            issue_date: data.issueDate,
            due_date: data.dueDate,
        });

        if (dbError) {
            console.error("DB Error:", dbError);
            throw new Error("Failed to save invoice");
        }

        // 5. Response (Expose editToken ONLY now)
        return NextResponse.json(
            {
                publicId,
                editToken,
                totals,
                message: "Invoice created successfully. Please save your edit token to make changes later.",
            },
            { status: 201 }
        );
    } catch (error) {
        return handleError(error);
    }
}
