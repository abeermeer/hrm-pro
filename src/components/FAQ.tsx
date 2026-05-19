"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How long does setup take?",
    answer: "Most teams are live within 20 minutes. Create your account, add your company details, and start adding employees. The system auto-seeds leave types and default shifts based on your country.",
  },
  {
    question: "Can I import existing employee data?",
    answer: "Yes! You can bulk import employees via CSV. We support all common employee fields including name, email, department, role, salary, and more.",
  },
  {
    question: "Is my data secure and isolated?",
    answer: "Absolutely. Each company's data is fully isolated. We use encryption at rest and in transit, and the platform is SOC2-ready with enterprise audit trails.",
  },
  {
    question: "What currencies and countries are supported?",
    answer: "We support multiple currencies and country-specific configurations for leave policies, tax rules, and payroll calculations.",
  },
  {
    question: "How does payroll LOP calculation work?",
    answer: "The payroll engine automatically calculates Loss of Pay based on attendance data, unpaid leave, and late penalties. Just review and approve.",
  },
  {
    question: "Is there a mobile app?",
    answer: "Yes! The platform is a Progressive Web App (PWA) that works on desktop, Android, and iOS. Install it directly from your browser.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Questions we get{" "}
            <span className="text-gray-400">asked all the time.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Can't find what you're looking for?{" "}
            <a href="mailto:contact@hrmpro.com" className="text-indigo-600 hover:underline">
              Email us
            </a>
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
