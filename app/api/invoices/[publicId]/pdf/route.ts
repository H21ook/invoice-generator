import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { renderInvoicePdf, InvoiceData } from "@/lib/pdf/renderInvoicePdf";
import { handleError, NotFoundError } from "@/lib/http/errors";

export const runtime = "nodejs";

type InvoiceRow = {
    public_id: string;
    status: string;
    currency: string;
    locale: string;
    issuer: InvoiceData["issuer"];
    customer: InvoiceData["customer"];
    items: InvoiceData["items"];
    totals: InvoiceData["totals"];
    notes: string | null;
    terms: string | null;
    issue_date: string | null;
    due_date: string | null;
};

/**
 * Handle GET PDF: Fetch invoice data and stream as PDF
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const { publicId } = await params;
        const supabaseAdmin = getSupabaseAdmin();
        const { searchParams } = new URL(req.url);
        const download = searchParams.get("download") === "1";

        // 1. Fetch invoice data
        const { data: invoice, error } = await supabaseAdmin
            .from("invoices")
            .select("public_id, status, currency, locale, issuer, customer, items, totals, notes, terms, issue_date, due_date")
            .eq("public_id", publicId)
            .single<InvoiceRow>();

        if (error || !invoice) {
            throw new NotFoundError("Invoice not found");
        }

        // 2. Render PDF
        // Casting to InvoiceData as DB uses snake_case for dates and our interface uses camelCase (internally we'll handle mapping if needed, but here we'll map manually for safety)
        const invoiceData: InvoiceData = {
            publicId: invoice.public_id,
            status: invoice.status,
            currency: invoice.currency,
            locale: invoice.locale,
            issuer: invoice.issuer,
            customer: invoice.customer,
            items: invoice.items,
            totals: invoice.totals,
            notes: invoice.notes ?? undefined,
            terms: invoice.terms ?? undefined,
            issueDate: invoice.issue_date ?? undefined,
            dueDate: invoice.due_date ?? undefined,
        };

        const pdfBuffer = await renderInvoicePdf(invoiceData);

        // 3. Stream PDF
        const filename = `invoice-${publicId}.pdf`;
        const headers = new Headers();
        headers.set("Content-Type", "application/pdf");

        if (download) {
            headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        } else {
            headers.set("Content-Disposition", `inline; filename="${filename}"`);
        }

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers,
        });
    } catch (error) {
        return handleError(error);
    }
}
