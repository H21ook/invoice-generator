import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function FinalCtaSection() {
  return (
    <section className="border-t border-border/50 bg-card px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Invoice without the hassle.</h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
          Join thousands of freelancers and small businesses who&apos;ve simplified their invoicing.
        </p>
        <Button size="lg" className="mt-8 rounded-full" asChild>
          <Link href="/invoices/create">
            Create your first invoice
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
