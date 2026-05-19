import { Users, GitGraph, CreditCard, Clock, CalendarOff, BarChart3, Shield, Zap, Target, FileText, Wallet, TrendingUp } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Employee Management",
    description: "Complete profiles, bulk import, salary history, and document vault. Your single source of truth for every person.",
  },
  {
    icon: GitGraph,
    title: "Org Chart",
    description: "Live interactive hierarchy. Search, collapse, and export to PNG.",
  },
  {
    icon: CreditCard,
    title: "Payroll Engine",
    description: "Auto-calculates LOP, overtime, late penalties, and custom pay components. Zero manual math.",
  },
  {
    icon: Clock,
    title: "Attendance Tracking",
    description: "Daily check-ins, corrections, and monthly summaries. Synced directly into payroll.",
  },
  {
    icon: CalendarOff,
    title: "Leave Management",
    description: "Policy-based leave with blackout periods, probation blocks, and carry-forward accrual.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "CSV exports, 12-month trend charts, and real-time dashboards.",
  },
  {
    icon: Shield,
    title: "Audit Logs",
    description: "Every action logged with who, when, and before/after values. Full compliance-ready history.",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Auto-triggered onboarding & offboarding, approval chains, and notifications.",
  },
  {
    icon: Target,
    title: "Performance Reviews",
    description: "Cycles, self-assessment, manager ratings, and goal tracking.",
  },
  {
    icon: FileText,
    title: "Document Vault",
    description: "Upload, track expiry, and archive documents securely.",
  },
  {
    icon: Wallet,
    title: "Expense Claims",
    description: "Submit, approve, and track reimbursements in one place.",
  },
  {
    icon: TrendingUp,
    title: "Asset Management",
    description: "Assign, track, and manage warranty alerts for company assets.",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Everything you need,{" "}
            <span className="text-gray-400">nothing you don't.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Twelve core modules built to work in harmony. Switch between them in one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
