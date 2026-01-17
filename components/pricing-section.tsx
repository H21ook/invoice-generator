import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Create and preview invoices",
    features: ["Unlimited invoice creation", "Preview before sending", "Basic templates"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pay per invoice",
    price: "$2",
    description: "Per invoice sent or downloaded",
    features: ["Everything in Free", "Public shareable links", "PDF export", "No subscription required"],
    cta: "Create invoice",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$9",
    description: "Per month, billed monthly",
    features: [
      "Everything in Pay per invoice",
      "Unlimited sends & downloads",
      "Payment tracking",
      "Partial payments",
      "Client management",
      "Full invoice history",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Pricing</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Start free. Pay only when you need to send or download.</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${plan.highlighted ? "border-primary bg-primary text-primary-foreground" : "border-border/50 bg-card"
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground">
                    Most popular
                  </span>
                </div>
              )}
              <div>
                <h3 className={`text-lg font-medium ${plan.highlighted ? "text-primary-foreground" : ""}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                </div>
                <p
                  className={`mt-2 text-sm ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}
                    />
                    <span
                      className={`text-sm ${plan.highlighted ? "text-primary-foreground/90" : "text-muted-foreground"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-8 w-full rounded-full ${plan.highlighted ? "bg-background text-foreground hover:bg-background/90" : ""
                  }`}
                variant={plan.highlighted ? "secondary" : "outline"}
                asChild
              >
                <Link href="/invoices/create">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
