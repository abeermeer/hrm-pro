"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coffee,
  Edit,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Loader2,
} from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ToastProvider"

const fetcher = (url: string): Promise<any> => api.get(url)

export default function AttendancePage() {
  const { success, error } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [view, setView] = useState<"daily" | "monthly">("daily")
  const [loading, setLoading] = useState(false)
  const [correctionForm, setCorrectionForm] = useState({ employee: "", date: "", type: "check-in", reason: "" })

  const { data: attendance, mutate } = useSWR(`/api/attendance?date=${selectedDate}`, fetcher, { refreshInterval: 30000 })
  const { data: employees } = useSWR("/api/employees?limit=100", fetcher)

  const filteredAttendance = attendance?.filter((r: any) => {
    const name = `${r.employee?.firstName || ""} ${r.employee?.lastName || ""}`.toLowerCase()
    const matchesSearch = name.includes(searchQuery.toLowerCase())
    const matchesDept = departmentFilter === "All" || r.employee?.department?.name === departmentFilter
    return matchesSearch && matchesDept
  }) || []

  const stats = {
    present: attendance?.filter((r: any) => r.status === "PRESENT" || r.status === "LATE").length || 0,
    absent: attendance?.filter((r: any) => r.status === "ABSENT").length || 0,
    onLeave: attendance?.filter((r: any) => r.status === "ON_LEAVE").length || 0,
    late: attendance?.filter((r: any) => r.status === "LATE").length || 0,
    halfDay: attendance?.filter((r: any) => r.status === "HALF_DAY").length || 0,
    notMarked: attendance?.filter((r: any) => r.status === "NOT_MARKED").length || 0,
  }

  const departments: string[] = ["All", ...Array.from(new Set((attendance || []).map((r: any) => r.employee?.department?.name).filter(Boolean))) as string[]]

  const handleCheckIn = async (employeeId: string) => {
    setLoading(true)
    try {
      await api.post("/api/attendance", {
        employeeId,
        date: selectedDate,
        checkIn: new Date().toISOString(),
        status: new Date().getHours() >= 9 && new Date().getMinutes() > 15 ? "LATE" : "PRESENT",
      })
      mutate()
      success("Checked in successfully")
    } catch (err: any) {
      error("Check-in failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async (employeeId: string) => {
    setLoading(true)
    try {
      const record = attendance?.find((r: any) => r.employeeId === employeeId)
      await api.post("/api/attendance", {
        employeeId,
        date: selectedDate,
        checkOut: new Date().toISOString(),
        status: record?.status || "PRESENT",
      })
      mutate()
      success("Checked out successfully")
    } catch (err: any) {
      error("Check-out failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!correctionForm.employee || !correctionForm.date || !correctionForm.reason) {
      error("Validation Error", "Please fill in all required fields")
      return
    }
    setLoading(true)
    try {
      await api.post("/api/attendance", {
        employeeId: correctionForm.employee,
        date: correctionForm.date,
        notes: `[CORRECTION] ${correctionForm.reason}`,
      })
      setShowCorrectionModal(false)
      setCorrectionForm({ employee: "", date: "", type: "check-in", reason: "" })
      mutate()
      success("Attendance correction submitted")
    } catch (err: any) {
      error("Correction failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PRESENT: { label: "Present", color: "bg-green-100 text-green-700", icon: CheckCircle },
    ABSENT: { label: "Absent", color: "bg-red-100 text-red-700", icon: XCircle },
    LATE: { label: "Late", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
    ON_LEAVE: { label: "On Leave", color: "bg-blue-100 text-blue-700", icon: Coffee },
    HALF_DAY: { label: "Half Day", color: "bg-purple-100 text-purple-700", icon: Clock },
    NOT_MARKED: { label: "Not Marked", color: "bg-gray-100 text-gray-700", icon: Clock },
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView("daily")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "daily" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}>Daily</button>
            <button onClick={() => setView("monthly")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}>Monthly</button>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Present", value: stats.present, color: "bg-green-100", icon: CheckCircle, iconColor: "text-green-600" },
          { label: "Absent", value: stats.absent, color: "bg-red-100", icon: XCircle, iconColor: "text-red-600" },
          { label: "Late", value: stats.late, color: "bg-amber-100", icon: AlertCircle, iconColor: "text-amber-600" },
          { label: "On Leave", value: stats.onLeave, color: "bg-blue-100", icon: Coffee, iconColor: "text-blue-600" },
          { label: "Half Day", value: stats.halfDay, color: "bg-purple-100", icon: Clock, iconColor: "text-purple-600" },
          { label: "Not Marked", value: stats.notMarked, color: "bg-gray-100", icon: Clock, iconColor: "text-gray-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {view === "daily" ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {departments.map((d) => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Check In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Check Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendance.map((record: any) => {
                  const StatusIcon = statusConfig[record.status]?.icon || Clock
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-medium flex-shrink-0">
                            {record.employee?.avatar || `${record.employee?.firstName?.[0] || ""}${record.employee?.lastName?.[0] || ""}`.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{record.employee?.firstName} {record.employee?.lastName}</div>
                            <div className="text-sm text-gray-500">{record.employee?.department?.name || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{record.workingHours > 0 ? `${record.workingHours}h` : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig[record.status]?.color || "bg-gray-100 text-gray-700"}`}>
                          <StatusIcon size={12} />
                          {statusConfig[record.status]?.label || record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!record.checkIn && record.status !== "ON_LEAVE" && (
                            <button onClick={() => handleCheckIn(record.employeeId)} disabled={loading} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">Check In</button>
                          )}
                          {record.checkIn && !record.checkOut && (
                            <button onClick={() => handleCheckOut(record.employeeId)} disabled={loading} className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50">Check Out</button>
                          )}
                          <button onClick={() => { setCorrectionForm({ ...correctionForm, employee: record.employeeId, date: selectedDate }); setShowCorrectionModal(true) }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredAttendance.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No attendance records found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Monthly Summary</h2>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft size={18} /></button>
              <span className="text-sm font-medium">{new Date(selectedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              <button className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Monthly view coming soon</p>
            <p className="text-sm mt-1">Connect to API to display historical data</p>
          </div>
        </div>
      )}

      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCorrectionModal(false)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Request Correction</h2>
              <button onClick={() => setShowCorrectionModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleCorrectionSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select value={correctionForm.employee} onChange={(e) => setCorrectionForm({ ...correctionForm, employee: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required>
                  <option value="">Select employee</option>
                  {employees?.employees?.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={correctionForm.date} onChange={(e) => setCorrectionForm({ ...correctionForm, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={correctionForm.reason} onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={3} placeholder="Explain why correction is needed..." required />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowCorrectionModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
