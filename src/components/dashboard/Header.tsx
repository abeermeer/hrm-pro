"use client"

import { useState } from "react"
import { Bell, Search, Menu, X, LogOut, Moon, Sun } from "lucide-react"
import { signOut } from "next-auth/react"
import { useTheme } from "@/components/ThemeProvider"

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
          <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees, payroll..."
            className="pl-10 pr-4 py-2 w-64 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => setShowMobileSearch(!showMobileSearch)}>
          {showMobileSearch ? <X size={20} /> : <Search size={20} />}
        </button>
      </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
            <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-slate-600">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            ND
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-900 dark:text-white">Narayan Dura</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Super Admin</div>
          </div>
        </div>
      </div>

      {showMobileSearch && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees, payroll..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}
