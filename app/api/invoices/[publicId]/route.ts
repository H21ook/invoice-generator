import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { compareTokens } from "@/lib/tokens";
import { calculateTotals, type InvoiceTotals } from "@/lib/totals";
import { handleError, ValidationError, NotFoundError, UnauthorizedError } from "@/lib/http/errors";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const UpdateInvoiceSchema = z.object({
    status: z.enum(["draft", "issued", "paid", "cancelled"]).optional(),
    currency: z.string().length(3).optional(),
    locale: z.string().optional(),
    issuer: z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        taxId: z.string().optional(),
    }).optional(),
    customer: z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
    }).optional(),
    items: z.array(
        z.object({
            description: z.string().min(1),
            qty: z.number().positive(),
            unitPrice: z.number().nonnegative(),
            taxRate: z.number().min(0).max(100).optional(),
            discount: z.number().min(0).max(100).optional(),
        })
    ).min(1).optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
});

type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;
type InvoiceTokenRow = {
    edit_token_hash: string;
};
type InvoiceItemsRow = {
    edit_token_hash: string;
    items: UpdateInvoiceInput["items"];
};
type InvoiceUpdateDb = {
    status?: UpdateInvoiceInput["status"];
    currency?: UpdateInvoiceInput["currency"];
    locale?: UpdateInvoiceInput["locale"];
    issuer?: UpdateInvoiceInput["issuer"];
    customer?: UpdateInvoiceInput["customer"];
    items?: UpdateInvoiceInput["items"];
    totals?: InvoiceTotals;
    notes?: UpdateInvoiceInput["notes"];
    terms?: UpdateInvoiceInput["terms"];
    issue_date?: UpdateInvoiceInput["issueDate"];
    due_date?: UpdateInvoiceInput["dueDate"];
};

/**
 * Handle GET: Publicly fetch invoice data
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const { publicId } = await params;
        const supabaseAdmin = getSupabaseAdmin();

        const { data: invoice, error } = await supabaseAdmin
            .from("invoices")
            .select("public_id, status, currency, locale, issuer, customer, items, totals, notes, terms, issue_date, due_date, created_at, updated_at")
            .eq("public_id", publicId)
            .single();

        if (error || !invoice) {
            throw new NotFoundError("Invoice not found");
        }

        return NextResponse.json(invoice);
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Handle PATCH: Update invoice (Requires X-Edit-Token)
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const { publicId } = await params;
        const supabaseAdmin = getSupabaseAdmin();
        const editToken = req.headers.get("X-Edit-Token");

        if (!editToken) {
            throw new UnauthorizedError("Edit token missing in X-Edit-Token header");
        }

        // 1. Fetch current invoice to verify token
        const { data: invoice, error: fetchError } = await supabaseAdmin
            .from("invoices")
            .select("edit_token_hash, items")
            .eq("public_id", publicId)
            .single<InvoiceItemsRow>();

        if (fetchError || !invoice) {
            throw new NotFoundError("Invoice not found");
        }

        // 2. Verify token (timing-safe)
        if (!compareTokens(editToken, invoice.edit_token_hash)) {
            throw new UnauthorizedError("Invalid edit token");
        }

        // 3. Rate Limiting
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const limiter = await rateLimit(`patch:${ip}`);
        if (!limiter.success) {
            return NextResponse.json({ error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" } }, { status: 429 });
        }

        // 4. Validate body
        const body = await req.json();
        const result = UpdateInvoiceSchema.safeParse(body);
        if (!result.success) {
            throw new ValidationError("Invalid update data", result.error.errors);
        }

        const updateData: UpdateInvoiceInput = { ...result.data };

        // 5. Recalculate totals if items or related fields change
        const totals = updateData.items ? calculateTotals(updateData.items) : undefined;

        // Mapping camelCase to snake_case for DB
        const dbUpdate: InvoiceUpdateDb = {};
        if (updateData.status) dbUpdate.status = updateData.status;
        if (updateData.currency) dbUpdate.currency = updateData.currency;
        if (updateData.locale) dbUpdate.locale = updateData.locale;
        if (updateData.issuer) dbUpdate.issuer = updateData.issuer;
        if (updateData.customer) dbUpdate.customer = updateData.customer;
        if (updateData.items) dbUpdate.items = updateData.items;
        if (totals) dbUpdate.totals = totals;
        if (updateData.notes) dbUpdate.notes = updateData.notes;
        if (updateData.terms) dbUpdate.terms = updateData.terms;
        if (updateData.issueDate) dbUpdate.issue_date = updateData.issueDate;
        if (updateData.dueDate) dbUpdate.due_date = updateData.dueDate;

        const { error: patchError } = await (supabaseAdmin as any)
            .from("invoices")
            .update(dbUpdate)
            .eq("public_id", publicId);

        if (patchError) {
            throw new Error("Failed to update invoice");
        }

        return NextResponse.json({ message: "Invoice updated successfully", totals });
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Handle DELETE: Delete invoice (Requires X-Edit-Token)
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const { publicId } = await params;
        const supabaseAdmin = getSupabaseAdmin();
        const editToken = req.headers.get("X-Edit-Token");

        if (!editToken) {
            throw new UnauthorizedError("Edit token missing");
        }

        // 1. Fetch current invoice to verify token
        const { data: invoice, error: fetchError } = await supabaseAdmin
            .from("invoices")
            .select("edit_token_hash")
            .eq("public_id", publicId)
            .single<InvoiceTokenRow>();

        if (fetchError || !invoice) {
            throw new NotFoundError("Invoice not found");
        }

        // 2. Verify token
        if (!compareTokens(editToken, invoice.edit_token_hash)) {
            throw new UnauthorizedError("Invalid edit token");
        }

        // 3. Delete
        const { error: deleteError } = await supabaseAdmin
            .from("invoices")
            .delete()
            .eq("public_id", publicId);

        if (deleteError) {
            throw new Error("Failed to delete invoice");
        }

        return NextResponse.json({ message: "Invoice deleted successfully" });
    } catch (error) {
        return handleError(error);
    }
}
