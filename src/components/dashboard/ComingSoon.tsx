import Link from "next/link"
import { ArrowLeft, Construction } from "lucide-react"

interface ComingSoonProps {
  title: string
  description?: string
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-indigo-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-500 max-w-md">
        {description || "This module is currently under development. It will be available soon."}
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 text-indigo-600 hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  )
}
