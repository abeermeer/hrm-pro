"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  GitGraph,
  Clock,
  CalendarOff,
  CreditCard,
  BarChart3,
  Shield,
  Settings,
  Target,
  Wallet,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

const navSections = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "HR MANAGEMENT",
    items: [
      { name: "Employees", href: "/dashboard/employees", icon: Users },
      { name: "Org Chart", href: "/dashboard/org-chart", icon: GitGraph },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { name: "Attendance", href: "/dashboard/attendance", icon: Clock },
      { name: "Leave Mgmt", href: "/dashboard/leave", icon: CalendarOff },
      { name: "Payroll", href: "/dashboard/payroll", icon: CreditCard },
      { name: "Performance", href: "/dashboard/performance", icon: Target },
      { name: "Expenses", href: "/dashboard/expenses", icon: Wallet },
      { name: "Assets", href: "/dashboard/assets", icon: TrendingUp },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    title: "SECURITY",
    items: [
      { name: "Audit Log", href: "/dashboard/audit-log", icon: Shield },
    ],
  },
]

interface SidebarProps {
  isMobile?: boolean
  onClose?: () => void
}

export default function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={`h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isMobile ? "w-64" : collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        {!isMobile && !collapsed && (
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            HRM Pro
          </Link>
        )}
        {isMobile && (
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            HRM Pro
          </Link>
        )}
        {isMobile ? (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      <nav className="py-4 overflow-y-auto flex-1">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            {(!collapsed || isMobile) && (
              <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <ul className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={isMobile ? onClose : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      } ${(!isMobile && collapsed) ? "justify-center" : ""}`}
                      title={(!isMobile && collapsed) ? item.name : undefined}
                    >
                      <item.icon size={18} />
                      {(!collapsed || isMobile) && <span>{item.name}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {(!collapsed || isMobile) && (
          <div className="px-4 mt-6">
            <Link
              href="/dashboard/settings"
              onClick={isMobile ? onClose : undefined}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  )
}
