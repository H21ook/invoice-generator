import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="px-4 pb-24 pt-20 sm:px-6 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Create invoices.
          <br />
          <span className="text-muted-foreground">No signup required.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
          A simple invoice generator for freelancers and small businesses. Share via link, export to PDF, and track
          payments when you need to.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="w-full rounded-full sm:w-auto" asChild>
            <Link href="/invoices/create">
              Create invoice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full rounded-full sm:w-auto bg-transparent" asChild>
            <Link href="#how-it-works">
              <Play className="mr-2 h-4 w-4" />
              See how it works
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
