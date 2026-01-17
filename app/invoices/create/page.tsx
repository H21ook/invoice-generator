"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  FileDownIcon,
  LinkIcon,
  HomeIcon,
  LayoutIcon,
  EyeIcon,
  ColumnsIcon,
} from "lucide-react"
import { InvoiceOrientationStrip } from "@/components/invoice-orientation-strip"
import { toast } from "sonner"

interface LineItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

interface Payment {
  id: string
  amount: number
  date: string
  note: string
}

interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  billFrom: {
    name: string
    email: string
    address: string
  }
  billTo: {
    name: string
    email: string
    address: string
  }
  items: LineItem[]
  taxRate: number
  discount: number
  paymentStatus: "unpaid" | "partially-paid" | "paid"
  payments: Payment[]
  notes: string
}

export default function CreateInvoicePage() {
  const [isGuest] = useState(true)
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "both">("both")
  const [publicId, setPublicId] = useState<string | null>(null)
  const [editToken, setEditToken] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)

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
      <header className="sticky top-0 z-50 border-b bg-background px-4 sm:px-6">
        {/* Main Header Row */}
        <div className="flex h-16 items-center justify-between">
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
            {isGuest ? (
              <>
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
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={isSaving}
                  className="px-4 shadow-md transition-all active:scale-95"
                >
                  {isSaving ? "..." : (publicId ? "Update" : "Create")}
                </Button>
                {/* Mobile specific simple menu or just the primary action */}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="hidden sm:flex"
                >
                  {isSaving ? "Saving..." : "Save draft"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={isSaving}
                >
                  {isSaving ? "Creating..." : "Send"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Subheader: View Mode Toggle */}
        <div className="flex items-center justify-center pb-3 pt-1">
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 sm:w-72 lg:grid-cols-3">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <LayoutIcon className="size-4" />
                <span>Edit</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <EyeIcon className="size-4" />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="both" className="hidden items-center gap-2 lg:flex">
                <ColumnsIcon className="size-4" />
                <span>Split View</span>
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
          {/* Editor Side */}
          <div className={cn(
            "transition-all duration-300 lg:h-full lg:overflow-y-auto border-r bg-background lg:bg-transparent",
            viewMode === "preview" ? "hidden" : "block"
          )}>
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
              <div className="mb-6 hidden sm:flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Invoice Editor</h2>
              </div>

              <Tabs defaultValue="general" className="w-full">
                <TabsList className="sticky top-20 lg:top-0 z-20 mb-8 flex w-full justify-start gap-1 overflow-x-auto border bg-background/95 p-1 shadow-sm backdrop-blur sm:w-max">
                  <TabsTrigger value="general" className="px-4 py-2">General</TabsTrigger>
                  <TabsTrigger value="items" className="px-4 py-2">Items</TabsTrigger>
                  <TabsTrigger value="payment" className="px-4 py-2">Payment</TabsTrigger>
                  <TabsTrigger value="notes" className="px-4 py-2">Notes</TabsTrigger>
                </TabsList>
                {/* General Tab */}
                <TabsContent value="general" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="invoiceNumber">Invoice Number</Label>
                        <div className="flex gap-2">
                          <Input
                            id="invoiceNumber"
                            value={invoiceData.invoiceNumber}
                            onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                          />
                          <Button variant="ghost" size="icon">
                            <EditIcon className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="issueDate">Issue Date</Label>
                          <Input
                            id="issueDate"
                            type="date"
                            value={invoiceData.issueDate}
                            onChange={(e) => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={invoiceData.dueDate}
                            onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={invoiceData.currency}
                          onValueChange={(value) => setInvoiceData({ ...invoiceData, currency: value })}
                        >
                          <SelectTrigger id="currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Bill From</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fromName">Company Name</Label>
                        <Input
                          id="fromName"
                          value={invoiceData.billFrom.name}
                          onChange={(e) =>
                            setInvoiceData({
                              ...invoiceData,
                              billFrom: { ...invoiceData.billFrom, name: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="fromEmail">Email</Label>
                        <Input
                          id="fromEmail"
                          type="email"
                          value={invoiceData.billFrom.email}
                          onChange={(e) =>
                            setInvoiceData({
                              ...invoiceData,
                              billFrom: { ...invoiceData.billFrom, email: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="fromAddress">Address</Label>
                        <Textarea
                          id="fromAddress"
                          value={invoiceData.billFrom.address}
                          onChange={(e) =>
                            setInvoiceData({
                              ...invoiceData,
                              billFrom: { ...invoiceData.billFrom, address: e.target.value },
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Bill To</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="toName">Client Name</Label>
                        <Input
                          id="toName"
                          value={invoiceData.billTo.name}
                          onChange={(e) =>
                            setInvoiceData({
                              ...invoiceData,
                              billTo: { ...invoiceData.billTo, name: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="toEmail">Email</Label>
                        <Input
                          id="toEmail"
                          type="email"
                          value={invoiceData.billTo.email}
                          onChange={(e) =>
                            setInvoiceData({
                              ...invoiceData,
                              billTo: { ...invoiceData.billTo, email: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="toAddress">Address</Label>
                        <Textarea
                          id="toAddress"
                          value={invoiceData.billTo.address}
                          onChange={(e) =>
                            setInvoiceData({
                              ...invoiceData,
                              billTo: { ...invoiceData.billTo, address: e.target.value },
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Items Tab */}
                <TabsContent value="items" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Line Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {invoiceData.items.map((item) => (
                          <div
                            key={item.id}
                            className="grid gap-4 rounded-lg border p-4 sm:grid-cols-[1fr_80px_100px_100px_auto]"
                          >
                            <div className="grid gap-2">
                              <Label>Item / Service</Label>
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                placeholder="Item name"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Qty</Label>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)
                                }
                                min="0"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Unit Price</Label>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                                }
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Total</Label>
                              <Input value={item.total.toFixed(2)} readOnly />
                            </div>
                            <div className="flex items-end">
                              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                                <TrashIcon className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button onClick={addItem} variant="outline" className="w-full bg-transparent">
                          <PlusIcon className="size-4" />
                          Add Item
                        </Button>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="taxRate" className="text-sm text-muted-foreground">
                              Tax
                            </Label>
                            <Input
                              id="taxRate"
                              type="number"
                              value={invoiceData.taxRate}
                              onChange={(e) =>
                                setInvoiceData({
                                  ...invoiceData,
                                  taxRate: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-20"
                            />
                            <span className="text-sm">%</span>
                          </div>
                          <span className="font-medium">${taxAmount.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="discount" className="text-sm text-muted-foreground">
                              Discount
                            </Label>
                            <Input
                              id="discount"
                              type="number"
                              value={invoiceData.discount}
                              onChange={(e) =>
                                setInvoiceData({
                                  ...invoiceData,
                                  discount: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-20"
                            />
                            <span className="text-sm">%</span>
                          </div>
                          <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                        </div>

                        <Separator />

                        <div className="flex justify-between text-lg font-semibold">
                          <span>Grand Total</span>
                          <span>${grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="paymentStatus">Status</Label>
                        <Select
                          value={invoiceData.paymentStatus}
                          onValueChange={(value: "unpaid" | "partially-paid" | "paid") =>
                            setInvoiceData({ ...invoiceData, paymentStatus: value })
                          }
                        >
                          <SelectTrigger id="paymentStatus">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="partially-paid">Partially Paid</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {invoiceData.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="grid gap-4 rounded-lg border p-4 sm:grid-cols-[100px_120px_1fr_auto]"
                          >
                            <div className="grid gap-2">
                              <Label>Amount</Label>
                              <Input
                                type="number"
                                value={payment.amount}
                                onChange={(e) =>
                                  updatePayment(payment.id, "amount", Number.parseFloat(e.target.value) || 0)
                                }
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={payment.date}
                                onChange={(e) => updatePayment(payment.id, "date", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Note</Label>
                              <Input
                                value={payment.note}
                                onChange={(e) => updatePayment(payment.id, "note", e.target.value)}
                                placeholder="Payment note"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button variant="ghost" size="icon" onClick={() => removePayment(payment.id)}>
                                <TrashIcon className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button onClick={addPayment} variant="outline" className="w-full bg-transparent">
                          <PlusIcon className="size-4" />
                          Add Payment
                        </Button>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Amount</span>
                          <span className="font-medium">${grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Paid</span>
                          <span className="font-medium text-green-600">${totalPaid.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Remaining</span>
                          <span className={remaining > 0 ? "text-orange-600" : "text-green-600"}>
                            ${remaining.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Invoice Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes / Terms</Label>
                        <Textarea
                          id="notes"
                          value={invoiceData.notes}
                          onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                          rows={6}
                          placeholder="Add payment terms, notes, or additional information..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Preview Side */}
          <div className={cn(
            "transition-all duration-300 lg:h-full lg:overflow-y-auto bg-muted/30",
            viewMode === "edit" ? "hidden" : (viewMode === "both" ? "hidden lg:block" : "block")
          )}>
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
              <div className="mb-6 hidden sm:flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Invoice Preview</h2>
              </div>

              {/* Invoice Preview Document */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="mb-8 flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="text-xl font-bold">{invoiceData.billFrom.name.charAt(0)}</span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold">{invoiceData.billFrom.name}</h3>
                    </div>
                    <div className="text-right">
                      <h2 className="text-3xl font-bold">INVOICE</h2>
                      <p className="text-muted-foreground mt-1 text-sm">{invoiceData.invoiceNumber}</p>
                    </div>
                  </div>

                  {/* Bill From / Bill To */}
                  <div className="mb-8 grid gap-8 sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase">From</p>
                      <p className="font-medium">{invoiceData.billFrom.name}</p>
                      <p className="text-muted-foreground text-sm">{invoiceData.billFrom.email}</p>
                      <p className="text-muted-foreground mt-1 whitespace-pre-line text-sm">
                        {invoiceData.billFrom.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase">Bill To</p>
                      <p className="font-medium">{invoiceData.billTo.name}</p>
                      <p className="text-muted-foreground text-sm">{invoiceData.billTo.email}</p>
                      <p className="text-muted-foreground mt-1 whitespace-pre-line text-sm">
                        {invoiceData.billTo.address}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">Issue Date</p>
                      <p className="text-sm">
                        {new Date(invoiceData.issueDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">Due Date</p>
                      <p className="text-sm">
                        {new Date(invoiceData.dueDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">Currency</p>
                      <p className="text-sm">{invoiceData.currency}</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-8">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item / Service</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Totals */}
                  <div className="mb-8 flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax ({invoiceData.taxRate}%)</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      {invoiceData.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discount ({invoiceData.discount}%)</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>${grandTotal.toFixed(2)}</span>
                      </div>
                      {totalPaid > 0 && (
                        <>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Paid</span>
                            <span>-${totalPaid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold text-orange-600">
                            <span>Amount Due</span>
                            <span>${remaining.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {invoiceData.notes && (
                    <div className="border-t pt-6">
                      <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase">Notes</p>
                      <p className="text-muted-foreground whitespace-pre-line text-sm">{invoiceData.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
