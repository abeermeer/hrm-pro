import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small teams getting started with structured HR.",
    price: "Free",
    period: "forever",
    cta: "Start Free",
    ctaLink: "/signup",
    popular: false,
    features: [
      "Up to 5 employees",
      "Core HR modules",
      "Leave & attendance",
      "Document vault & org chart",
      "Community support",
    ],
  },
  {
    name: "Growth",
    description: "Everything you need to scale your HR operations without limits.",
    price: "$3",
    period: "/emp/mo",
    minimum: "Minimum $25 / month",
    cta: "Start Free Trial",
    ctaLink: "/signup",
    popular: true,
    features: [
      "Unlimited employees",
      "All HR modules",
      "Multi-level approvals",
      "Performance reviews",
      "Shift roster",
      "Expense claims",
      "Payslip PDFs",
      "CSV exports & reports",
      "Email support",
    ],
  },
  {
    name: "Enterprise",
    description: "For companies with 200+ employees that need guarantees and dedicated support.",
    price: "Custom",
    period: "",
    cta: "Contact Sales",
    ctaLink: "mailto:contact@hrmpro.com",
    popular: false,
    features: [
      "Everything in Growth",
      "200+ employees",
      "99.9% uptime SLA",
      "Priority bug fixes",
      "Dedicated account manager",
      "Custom contract & invoicing",
      "SSO / SAML",
      "Compliance reports",
      "Onboarding assistance",
    ],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Pay for what you use.{" "}
            <span className="text-gray-400">Scale without surprises.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Starter is always free · Monthly billed via Stripe · Cancel anytime
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 sm:p-8 ${
                plan.popular
                  ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20 scale-105"
                  : "bg-white border border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className={`text-xl font-semibold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h3>
              <p className={`mt-2 text-sm ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-sm ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              {plan.minimum && (
                <p className={`mt-1 text-sm ${plan.popular ? "text-gray-300" : "text-gray-500"}`}>
                  {plan.minimum}
                </p>
              )}

              <Link
                href={plan.ctaLink}
                className={`mt-6 block w-full py-3 px-4 rounded-lg text-center font-medium transition-all ${
                  plan.popular
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? "text-indigo-400" : "text-indigo-600"}`} />
                    <span className={`text-sm ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
