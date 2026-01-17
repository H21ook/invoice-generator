"use client"

import { useState } from "react"
import { InfoIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InvoiceOrientationStripProps {
  isGuest?: boolean
}

export function InvoiceOrientationStrip({ isGuest = true }: InvoiceOrientationStripProps) {
  const [isVisible, setIsVisible] = useState(isGuest)

  if (!isVisible) return null

  return (
    <div className="border-b bg-muted/30 px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <InfoIcon className="mt-0.5 size-4 flex-shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              Create and send an invoice in minutes — no account required.
            </p>
            <p className="text-xs text-muted-foreground">
              You can download a PDF or share a public link instantly. Invoices created as a guest are stored locally on
              this device.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0"
          title="Dismiss"
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
