import { FileSpreadsheet, HelpCircle, Cog } from "lucide-react"

const problems = [
  {
    icon: FileSpreadsheet,
    title: "Messy spreadsheets",
    description: "Excel and Word invoices look unprofessional and take forever to format correctly.",
  },
  {
    icon: HelpCircle,
    title: "No payment tracking",
    description: "Did they pay? Partially? When? You shouldn't need a separate system to know.",
  },
  {
    icon: Cog,
    title: "Overcomplicated tools",
    description: "Enterprise software with features you'll never use - overkill for simple jobs.",
  },
]

export function ProblemSolutionSection() {
  return (
    <section className="border-t border-border/50 bg-card px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">The problem</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Invoicing shouldn&apos;t feel like work
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {problems.map((problem) => (
            <div key={problem.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <problem.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-medium">{problem.title}</h3>
              <p className="mt-2 text-muted-foreground">{problem.description}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">The solution</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple invoicing that just works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Create professional invoices in seconds. No account needed to start - sign up only when you want to track
            payments and manage clients.
          </p>
        </div>
      </div>
    </section>
  )
}
