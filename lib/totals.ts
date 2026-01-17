export interface InvoiceItem {
    description: string;
    qty: number;
    unitPrice: number;
    taxRate?: number; // percentage (e.g., 20 for 20%)
    discount?: number; // percentage (e.g., 5 for 5%)
}

export interface InvoiceTotals {
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    grandTotal: number;
}

/**
 * Computes subtotal, tax total, discount total, and grand total for an array of items.
 * All calculations are done in a way to avoid common floating point issues (rounding to 2 decimals).
 */
export function calculateTotals(items: InvoiceItem[]): InvoiceTotals {
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    for (const item of items) {
        const itemSubtotal = item.qty * item.unitPrice;

        // Apply discount if present
        let itemDiscountAmount = 0;
        if (item.discount) {
            itemDiscountAmount = (itemSubtotal * item.discount) / 100;
            discountTotal += itemDiscountAmount;
        }

        const itemTaxableAmount = itemSubtotal - itemDiscountAmount;

        // Apply tax if present
        let itemTaxAmount = 0;
        if (item.taxRate) {
            itemTaxAmount = (itemTaxableAmount * item.taxRate) / 100;
            taxTotal += itemTaxAmount;
        }

        subtotal += itemSubtotal;
    }

    const grandTotal = subtotal - discountTotal + taxTotal;

    return {
        subtotal: round(subtotal),
        taxTotal: round(taxTotal),
        discountTotal: round(discountTotal),
        grandTotal: round(grandTotal),
    };
}

function round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
