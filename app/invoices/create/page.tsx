"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileDownIcon,
  LinkIcon,
  HomeIcon,
  LayoutIcon,
  EyeIcon,
  ColumnsIcon,
} from "lucide-react"
import { InvoiceOrientationStrip } from "@/components/invoice-orientation-strip"
import { toast } from "sonner"
import { InvoiceEditor } from "./components/InvoiceEditor"
import { InvoicePreview } from "./components/InvoicePreview"
import type { InvoiceData, LineItem, Payment } from "./types"

export default function CreateInvoicePage() {
  const [isGuest] = useState(true)
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "both">("both")
  const [publicId, setPublicId] = useState<string | null>(null)
  const [editToken, setEditToken] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)

  // Prevent "both" mode on mobile
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined" && window.innerWidth < 1024 && viewMode === "both") {
        setViewMode("edit")
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [viewMode])

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "INV-2024-001",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    currency: "USD",
    billFrom: {
      name: "Your Company Inc.",
      email: "hello@yourcompany.com",
      address: "123 Business St, Suite 100\nSan Francisco, CA 94102",
    },
    billTo: {
      name: "Client Company LLC",
      email: "billing@clientcompany.com",
      address: "456 Client Ave\nNew York, NY 10001",
    },
    items: [
      {
        id: "1",
        name: "Website Design",
        quantity: 1,
        unitPrice: 2500,
        total: 2500,
      },
      {
        id: "2",
        name: "Development Hours",
        quantity: 40,
        unitPrice: 100,
        total: 4000,
      },
    ],
    taxRate: 10,
    discount: 0,
    paymentStatus: "unpaid",
    payments: [],
    notes: "Payment is due within 30 days. Thank you for your business!",
  })

  // Calculate totals
  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = (subtotal * invoiceData.taxRate) / 100
  const discountAmount = (subtotal * invoiceData.discount) / 100
  const grandTotal = subtotal + taxAmount - discountAmount
  const totalPaid = invoiceData.payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remaining = grandTotal - totalPaid

  useEffect(() => {
    if (isGuest) {
      const saved = localStorage.getItem("invoice-draft")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setInvoiceData(parsed)
        } catch {
          // Invalid data, ignore
        }
      }
    }
  }, [isGuest])

  useEffect(() => {
    if (isGuest) {
      const timer = setTimeout(() => {
        localStorage.setItem("invoice-draft", JSON.stringify(invoiceData))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [invoiceData, isGuest])

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: "New Item",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setInvoiceData({ ...invoiceData, items: [...invoiceData.items, newItem] })
  }

  const removeItem = (id: string) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((item) => item.id !== id),
    })
  }

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = invoiceData.items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          updated.total = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    })
    setInvoiceData({ ...invoiceData, items: updatedItems })
  }

  const addPayment = () => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      note: "",
    }
    setInvoiceData({ ...invoiceData, payments: [...invoiceData.payments, newPayment] })
  }

  const removePayment = (id: string) => {
    setInvoiceData({
      ...invoiceData,
      payments: invoiceData.payments.filter((payment) => payment.id !== id),
    })
  }

  const updatePayment = (id: string, field: keyof Payment, value: string | number) => {
    const updatedPayments = invoiceData.payments.map((payment) =>
      payment.id === id ? { ...payment, [field]: value } : payment,
    )
    setInvoiceData({ ...invoiceData, payments: updatedPayments })
  }

  const handleSaveDraft = async () => {
    if (isGuest) {
      toast.success("Saved locally", {
        description: "Your invoice is automatically saved on this device.",
      })
      return
    }

    // For logged-in users, save to server
    await createInvoice("draft")
  }

  const handleSend = async () => {
    await createInvoice("issued")
  }

  const createInvoice = async (status: "draft" | "issued" = "draft") => {
    if (!invoiceData.billFrom.name || !invoiceData.billTo.name || invoiceData.items.length === 0) {
      toast.error("Please fill in all required fields", {
        description: "Company name, client name, and at least one item are required.",
      })
      return
    }

    setIsSaving(true)
    try {
      // Transform local invoice data to API format
      const apiPayload = {
        currency: invoiceData.currency,
        locale: "en-US",
        issuer: {
          name: invoiceData.billFrom.name,
          email: invoiceData.billFrom.email || undefined,
          address: invoiceData.billFrom.address || undefined,
        },
        customer: {
          name: invoiceData.billTo.name,
          email: invoiceData.billTo.email || undefined,
          address: invoiceData.billTo.address || undefined,
        },
        items: invoiceData.items.map((item) => ({
          description: item.name,
          qty: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: invoiceData.taxRate || undefined,
          discount: invoiceData.discount || undefined,
        })),
        notes: invoiceData.notes || undefined,
        terms: undefined,
        issueDate: invoiceData.issueDate || undefined,
        dueDate: invoiceData.dueDate || undefined,
      }

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || "Failed to create invoice")
      }

      const data = await response.json()
      setPublicId(data.publicId)
      setEditToken(data.editToken)

      // Save edit token to localStorage for later use
      if (data.editToken) {
        localStorage.setItem(`invoice-${data.publicId}-token`, data.editToken)
      }

      toast.success(status === "draft" ? "Draft saved" : "Invoice created", {
        description: `Invoice created successfully! ${data.editToken ? "Save your edit token to make changes later." : ""}`,
      })
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast.error("Failed to create invoice", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmail = () => {
    toast.success("Email sent", { description: "Invoice has been emailed." })
  }

  const handleDownloadPDF = async () => {
    if (!publicId) {
      toast.error("No invoice found", {
        description: "Please create an invoice first.",
      })
      return
    }

    setIsLoadingPDF(true)
    try {
      const response = await fetch(`/api/invoices/${publicId}/pdf?download=1`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${publicId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("PDF downloaded", {
        description: "Invoice PDF has been downloaded.",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast.error("Failed to download PDF", {
        description: "Please try again.",
      })
    } finally {
      setIsLoadingPDF(false)
    }
  }

  const handleCopyLink = async () => {
    if (!publicId) {
      toast.error("No invoice found", {
        description: "Please create an invoice first.",
      })
      return
    }

    const invoiceUrl = `${window.location.origin}/api/invoices/${publicId}`

    try {
      await navigator.clipboard.writeText(invoiceUrl)
      toast.success("Link copied", {
        description: "Invoice link copied to clipboard.",
      })
    } catch (error) {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = invoiceUrl
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      toast.success("Link copied", {
        description: "Invoice link copied to clipboard.",
      })
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Consolidated Sticky Header Wrapper */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Main Header Row */}
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            {isGuest ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  title="Back to home"
                >
                  <HomeIcon className="size-5" />
                </Link>
                <div>
                  <h1 className="text-lg font-bold leading-none sm:text-xl">Invoice Pro</h1>
                  <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
                    Free Generator - Export PDF
                  </p>
                </div>
              </div>
            ) : (
              <h1 className="text-xl font-bold sm:text-2xl">Create Invoice</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isGuest && (
              <div className="hidden sm:flex items-center gap-2">
                {publicId && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleDownloadPDF}
                      disabled={isLoadingPDF}
                      variant="outline"
                    >
                      <FileDownIcon className="size-4" />
                      {isLoadingPDF ? "Loading..." : "PDF"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                    >
                      <LinkIcon className="size-4" />
                      Copy
                    </Button>
                  </>
                )}
              </div>
            )}
            <Button
              size="sm"
              onClick={handleSend}
              disabled={isSaving}
              className="px-4 shadow-md transition-all active:scale-95"
            >
              {isSaving ? "..." : (publicId ? "Update" : "Create")}
            </Button>
          </div>
        </div>

        {/* Subheader: View Mode Toggle (Mobile Specific or Split Control) */}
        <div className="flex h-14 items-center justify-center border-t px-4 lg:hidden">
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 sm:w-72">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <LayoutIcon className="size-4" />
                <span>Edit</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <EyeIcon className="size-4" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Desktop Split View Control */}
        <div className="hidden items-center justify-center border-t pb-3 pt-1 lg:flex">
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as any)}
            className="w-auto"
          >
            <TabsList className="grid w-72 grid-cols-3">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <LayoutIcon className="size-4" />
                <span>Edit</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <EyeIcon className="size-4" />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="both" className="items-center gap-2 lg:flex">
                <ColumnsIcon className="size-4" />
                <span>Split</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <InvoiceOrientationStrip isGuest={isGuest} />

      {/* Main Content - Responsive Grid */}
      <div className="flex-1 lg:overflow-hidden">
        <div className={cn(
          "grid w-full lg:h-full",
          viewMode === "both" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        )}>
          <InvoiceEditor
            viewMode={viewMode}
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
            addPayment={addPayment}
            removePayment={removePayment}
            updatePayment={updatePayment}
            subtotal={subtotal}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            totalPaid={totalPaid}
            remaining={remaining}
          />

          <InvoicePreview
            viewMode={viewMode}
            invoiceData={invoiceData}
            subtotal={subtotal}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            totalPaid={totalPaid}
            remaining={remaining}
          />
        </div>
      </div>
    </div>
  )
}


