"use client"

import type { Dispatch, SetStateAction } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { PlusIcon, TrashIcon, EditIcon } from "lucide-react"
import type { InvoiceData, LineItem, Payment } from "../types"

interface InvoiceEditorProps {
  viewMode: "edit" | "preview" | "both"
  invoiceData: InvoiceData
  setInvoiceData: Dispatch<SetStateAction<InvoiceData>>
  addItem: () => void
  removeItem: (id: string) => void
  updateItem: (id: string, field: keyof LineItem, value: string | number) => void
  addPayment: () => void
  removePayment: (id: string) => void
  updatePayment: (id: string, field: keyof Payment, value: string | number) => void
  subtotal: number
  taxAmount: number
  discountAmount: number
  grandTotal: number
  totalPaid: number
  remaining: number
}

export function InvoiceEditor({
  viewMode,
  invoiceData,
  setInvoiceData,
  addItem,
  removeItem,
  updateItem,
  addPayment,
  removePayment,
  updatePayment,
  subtotal,
  taxAmount,
  discountAmount,
  grandTotal,
  totalPaid,
  remaining,
}: InvoiceEditorProps) {
  return (
          <div className={cn(
            "transition-all duration-300 lg:h-full lg:overflow-y-auto border-r bg-background lg:bg-transparent",
            viewMode === "preview" ? "hidden" : "block"
          )}>
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
              <div className="mb-6 hidden sm:flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Invoice Editor</h2>
              </div>

              <Tabs defaultValue="general" className="w-full">
                <TabsList className="sticky top-[112px] lg:top-0 z-20 mb-8 flex w-full justify-start gap-1 overflow-x-auto border bg-background/95 p-1 shadow-sm backdrop-blur sm:w-max">
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
  )
}
