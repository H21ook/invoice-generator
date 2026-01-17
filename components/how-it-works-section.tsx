const steps = [
  {
    number: "01",
    title: "Create an invoice instantly",
    description: "Fill in your details and line items. No account required—just start creating.",
  },
  {
    number: "02",
    title: "Share or download",
    description: "Send a public link to your client or download a print-ready PDF.",
  },
  {
    number: "03",
    title: "Track payments",
    description: "Sign up to track payment status, manage installments, and keep a full history.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">How it works</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps to get paid
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-px w-full -translate-x-1/2 translate-y-1/2 bg-border md:block" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-background">
                  <span className="text-lg font-semibold text-muted-foreground">{step.number}</span>
                </div>
                <h3 className="mt-6 text-lg font-medium">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
