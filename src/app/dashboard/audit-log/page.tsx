"use client"

import { useState } from "react"
import useSWR from "swr"
import { Shield, Search, Filter, Calendar, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

const fetcher = (url: string): Promise<any> => api.get(url)

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  APPROVE: "bg-purple-100 text-purple-700",
  REJECT: "bg-red-100 text-red-700",
  GENERATE: "bg-indigo-100 text-indigo-700",
  "CHECK-IN": "bg-green-100 text-green-700",
  "CHECK-OUT": "bg-amber-100 text-amber-700",
  EXPORT: "bg-gray-100 text-gray-700",
  BACKUP: "bg-cyan-100 text-cyan-700",
  LOGIN: "bg-teal-100 text-teal-700",
}

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState("All")
  const [actionFilter, setActionFilter] = useState("All")

  const { data: entries, isLoading } = useSWR("/api/audit?limit=100", fetcher)

  const modules: string[] = ["All", ...(Array.from(new Set(entries?.map((e: any) => e.module) || [])) as string[])]
  const actions: string[] = ["All", ...(Array.from(new Set(entries?.map((e: any) => e.action) || [])) as string[])]

  const filteredEntries = entries?.filter((e: any) => {
    const userName = e.user?.name || ""
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) || e.details?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesModule = moduleFilter === "All" || e.module === moduleFilter
    const matchesAction = actionFilter === "All" || e.action === actionFilter
    return matchesSearch && matchesModule && matchesAction
  }) || []

  const formatTimestamp = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const getInitials = (entry: any) => {
    if (entry.user?.name) {
      return entry.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    }
    return "SY"
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Complete history of all system actions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              {modules.map((m) => <option key={m} value={m}>{m === "All" ? "All Modules" : m}</option>)}
            </select>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              {actions.map((a) => <option key={a} value={a}>{a === "All" ? "All Actions" : a}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {filteredEntries.map((entry: any) => (
                <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-medium flex-shrink-0">
                      {getInitials(entry)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{entry.user?.name || "System"}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${actionColors[entry.action] || "bg-gray-100 text-gray-700"}`}>
                          {entry.action}
                        </span>
                        <span className="text-xs text-gray-400">{entry.module}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">{entry.details}</div>
                      {(entry.before && entry.before !== "—" || entry.after && entry.after !== "—") && (
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-red-600">Before: {entry.before || "—"}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-green-600">After: {entry.after || "—"}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatTimestamp(entry.createdAt)}</span>
                        <span>IP: {entry.ipAddress || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredEntries.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No audit entries found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
