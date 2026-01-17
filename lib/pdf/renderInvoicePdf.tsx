import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { InvoiceTotals, InvoiceItem } from "@/lib/totals";

export interface InvoiceData {
    publicId: string;
    status: string;
    currency: string;
    locale: string;
    issuer: {
        name: string;
        address?: string;
        email?: string;
        phone?: string;
        taxId?: string;
    };
    customer: {
        name: string;
        address?: string;
        email?: string;
        phone?: string;
    };
    items: InvoiceItem[];
    totals: InvoiceTotals;
    notes?: string;
    terms?: string;
    issueDate?: string;
    dueDate?: string;
    invoiceNumber?: string;
}

// Create styles matching the UI
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        color: "#444",
        fontFamily: "Helvetica",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    logoSection: {
        flexDirection: "column",
    },
    logo: {
        width: 40,
        height: 40,
        backgroundColor: "#000",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    logoText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    companyName: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 4,
    },
    titleSection: {
        textAlign: "right",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
    },
    invoiceNumber: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 4,
    },
    addressSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    addressColumn: {
        width: "45%",
    },
    addressTitle: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#6b7280",
        textTransform: "uppercase",
        marginBottom: 4,
    },
    addressName: {
        fontWeight: "bold",
        marginBottom: 2,
    },
    addressText: {
        color: "#6b7280",
        lineHeight: 1.4,
    },
    datesSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
        borderBottom: 1,
        borderBottomColor: "#e5e7eb",
        paddingBottom: 20,
    },
    dateBox: {
        flexDirection: "column",
    },
    dateTitle: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#6b7280",
        textTransform: "uppercase",
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 10,
    },
    table: {
        display: "flex",
        width: "auto",
        marginBottom: 30,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomColor: "#e5e7eb",
        borderBottomWidth: 1,
        alignItems: "center",
        minHeight: 30,
    },
    tableHeader: {
        backgroundColor: "#f9fafb",
    },
    tableColDescription: { width: "40%" },
    tableColQty: { width: "15%", textAlign: "right" },
    tableColUnitPrice: { width: "22.5%", textAlign: "right" },
    tableColTotal: { width: "22.5%", textAlign: "right" },
    tableCell: {
        padding: 5,
    },
    headerText: {
        fontWeight: "bold",
    },
    totalsSection: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 30,
    },
    totalsWrapper: {
        width: "40%",
    },
    totalsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    totalsLabel: {
        color: "#6b7280",
    },
    grandTotalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 8,
        marginTop: 8,
        borderTop: 1,
        borderTopColor: "#e5e7eb",
    },
    grandTotalLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
    grandTotalValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
    notesSection: {
        marginTop: 20,
        borderTop: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 15,
    },
    notesTitle: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#6b7280",
        textTransform: "uppercase",
        marginBottom: 4,
    },
    notesText: {
        color: "#6b7280",
        lineHeight: 1.4,
    },
});

// Helper component for table cells
const TableCell = ({ children, style }: { children: any; style?: any }) => (
    <View style={[styles.tableCell, style]}>
        <Text>{children}</Text>
    </View>
);

// Formatting helpers
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(amount);
};

const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Invoice Document component
const InvoiceDocument = ({ data }: { data: InvoiceData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoSection}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>{data.issuer.name ? data.issuer.name.charAt(0) : "I"}</Text>
                    </View>
                    <Text style={styles.companyName}>{data.issuer.name}</Text>
                </View>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>INVOICE</Text>
                    <Text style={styles.invoiceNumber}>{data.invoiceNumber || data.publicId}</Text>
                </View>
            </View>

            {/* Address Section */}
            <View style={styles.addressSection}>
                <View style={styles.addressColumn}>
                    <Text style={styles.addressTitle}>From</Text>
                    <Text style={styles.addressName}>{data.issuer.name}</Text>
                    {data.issuer.email && <Text style={styles.addressText}>{data.issuer.email}</Text>}
                    {data.issuer.address && <Text style={styles.addressText}>{data.issuer.address}</Text>}
                </View>
                <View style={styles.addressColumn}>
                    <Text style={styles.addressTitle}>Bill To</Text>
                    <Text style={styles.addressName}>{data.customer.name}</Text>
                    {data.customer.email && <Text style={styles.addressText}>{data.customer.email}</Text>}
                    {data.customer.address && <Text style={styles.addressText}>{data.customer.address}</Text>}
                </View>
            </View>

            {/* Dates Section */}
            <View style={styles.datesSection}>
                <View style={styles.dateBox}>
                    <Text style={styles.dateTitle}>Issue Date</Text>
                    <Text style={styles.dateValue}>{formatDate(data.issueDate)}</Text>
                </View>
                <View style={styles.dateBox}>
                    <Text style={styles.dateTitle}>Due Date</Text>
                    <Text style={styles.dateValue}>{formatDate(data.dueDate)}</Text>
                </View>
                <View style={styles.dateBox}>
                    <Text style={styles.dateTitle}>Currency</Text>
                    <Text style={styles.dateValue}>{data.currency}</Text>
                </View>
            </View>

            {/* Items Table */}
            <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]} fixed>
                    <TableCell style={[styles.tableColDescription, styles.headerText]}>Item / Service</TableCell>
                    <TableCell style={[styles.tableColQty, styles.headerText]}>Qty</TableCell>
                    <TableCell style={[styles.tableColUnitPrice, styles.headerText]}>Unit Price</TableCell>
                    <TableCell style={[styles.tableColTotal, styles.headerText]}>Total</TableCell>
                </View>
                {data.items.map((item, index) => {
                    const total = item.qty * item.unitPrice;
                    return (
                        <View key={index} style={styles.tableRow} wrap={false}>
                            <TableCell style={styles.tableColDescription}>{item.description}</TableCell>
                            <TableCell style={styles.tableColQty}>{item.qty}</TableCell>
                            <TableCell style={styles.tableColUnitPrice}>{formatCurrency(item.unitPrice, data.currency)}</TableCell>
                            <TableCell style={styles.tableColTotal}>{formatCurrency(total, data.currency)}</TableCell>
                        </View>
                    );
                })}
            </View>

            {/* Totals Section */}
            <View style={styles.totalsSection} wrap={false}>
                <View style={styles.totalsWrapper}>
                    <View style={styles.totalsRow}>
                        <Text style={styles.totalsLabel}>Subtotal</Text>
                        <Text>{formatCurrency(data.totals.subtotal, data.currency)}</Text>
                    </View>
                    {data.totals.taxTotal > 0 && (
                        <View style={styles.totalsRow}>
                            <Text style={styles.totalsLabel}>Tax</Text>
                            <Text>{formatCurrency(data.totals.taxTotal, data.currency)}</Text>
                        </View>
                    )}
                    {data.totals.discountTotal > 0 && (
                        <View style={styles.totalsRow}>
                            <Text style={styles.totalsLabel}>Discount</Text>
                            <Text>-{formatCurrency(data.totals.discountTotal, data.currency)}</Text>
                        </View>
                    )}
                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Total</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(data.totals.grandTotal, data.currency)}</Text>
                    </View>
                </View>
            </View>

            {/* Notes Section */}
            {data.notes && (
                <View style={styles.notesSection} wrap={false}>
                    <Text style={styles.notesTitle}>Notes</Text>
                    <Text style={styles.notesText}>{data.notes}</Text>
                </View>
            )}
        </Page>
    </Document>
);

/**
 * Renders an invoice to a PDF buffer.
 */
export async function renderInvoicePdf(data: InvoiceData): Promise<Buffer> {
    const buffer = await renderToBuffer(<InvoiceDocument data={data} />);
    return Buffer.from(buffer);
}
