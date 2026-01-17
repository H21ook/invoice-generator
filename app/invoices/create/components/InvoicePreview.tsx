"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import type { InvoiceData } from "../types"

interface InvoicePreviewProps {
  viewMode: "edit" | "preview" | "both"
  invoiceData: InvoiceData
  subtotal: number
  taxAmount: number
  discountAmount: number
  grandTotal: number
  totalPaid: number
  remaining: number
}

export function InvoicePreview({
  viewMode,
  invoiceData,
  subtotal,
  taxAmount,
  discountAmount,
  grandTotal,
  totalPaid,
  remaining,
}: InvoicePreviewProps) {
  const [scaleFactor, setScaleFactor] = useState(1)
  const [contentHeight, setContentHeight] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const updateScale = useCallback(() => {
    if (!previewContainerRef.current || !previewRef.current) return

    const containerWidth = previewContainerRef.current.clientWidth
    const targetWidth = 800 // Fixed "paper" width for the preview

    if (containerWidth > 0) {
      // Calculate scale factor to fit to width
      const nextScale = containerWidth < targetWidth ? containerWidth / targetWidth : 1
      setScaleFactor(nextScale)

      // Measure exact content height using scrollHeight
      const h = previewRef.current.scrollHeight
      if (h > 0) setContentHeight(h)
    }
  }, [])

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(updateScale)
    })

    if (previewContainerRef.current) observer.observe(previewContainerRef.current)
    if (previewRef.current) observer.observe(previewRef.current)

    updateScale()
    return () => observer.disconnect()
  }, [updateScale])

  useEffect(() => {
    if (viewMode === "preview" || viewMode === "both") {
      const frame = window.requestAnimationFrame(updateScale)
      return () => window.cancelAnimationFrame(frame)
    }
  }, [viewMode, updateScale, invoiceData])

  return (
          <div className={cn(
            "transition-all duration-300 lg:h-full lg:overflow-y-auto bg-muted/30",
            viewMode === "edit" ? "hidden" : (viewMode === "both" ? "hidden lg:block" : "block")
          )}>
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10" ref={previewContainerRef}>
              <div className="mb-6 hidden sm:flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Invoice Preview</h2>
              </div>

              {/* Scaled Preview Wrapper */}
              <div
                className="relative w-full overflow-hidden"
                style={{
                  height: scaleFactor < 1 ? `${contentHeight * scaleFactor}px` : 'auto',
                  minHeight: '200px'
                }}
              >
                <div
                  ref={previewRef}
                  className={cn(
                    "origin-top",
                    scaleFactor < 1 ? "absolute left-1/2 -translate-x-1/2" : "relative w-full"
                  )}
                  style={{
                    width: '800px',
                    transform: scaleFactor < 1 ? `scale(${scaleFactor})` : 'none',
                    transformOrigin: 'top center',
                  }}
                >
                  {/* Invoice Preview Document */}
                  <Card className="shadow-lg border-none sm:border">
                    <CardContent className="p-6 sm:p-12">
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
  )
}
