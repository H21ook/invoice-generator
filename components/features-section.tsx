import { UserX, Link2, FileDown, CreditCard, History } from "lucide-react"

const features = [
  {
    icon: UserX,
    title: "No signup required",
    description: "Start creating invoices immediately. Sign up only when you need more.",
  },
  {
    icon: Link2,
    title: "Public invoice links",
    description: "Share a clean, professional link with your clients - no attachments needed.",
  },
  {
    icon: FileDown,
    title: "Print-ready PDF export",
    description: "Download beautifully formatted PDFs ready to print or attach to emails.",
  },
  {
    icon: CreditCard,
    title: "Partial payments",
    description: "Track installments and partial payments without the confusion.",
  },
  {
    icon: History,
    title: "Invoice history",
    description: "Registered users get full history, payment status, and client management.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border/50 bg-card px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Features</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need, nothing you don&apos;t
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`rounded-2xl border border-border/50 bg-background p-6 transition-colors hover:border-border ${
                index === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:flex lg:flex-col lg:justify-center" : ""
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
