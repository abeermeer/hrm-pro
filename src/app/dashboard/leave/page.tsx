"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Calendar,
  Plus,
  Check,
  X,
  Clock,
  Search,
  AlertCircle,
  FileText,
  XCircle,
  Loader2,
} from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ToastProvider"

const fetcher = (url: string): Promise<any> => api.get(url)

export default function LeavePage() {
  const { success, error } = useToast()
  const { data: requests, mutate: mutateRequests } = useSWR("/api/leave", fetcher)
  const { data: leaveTypes } = useSWR("/api/leave-types", fetcher)
  const { data: leaveBalances } = useSWR("/api/leave-balances", fetcher)
  const { data: employees } = useSWR("/api/employees?limit=100", fetcher)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [view, setView] = useState<"requests" | "balances">("requests")
  const [loading, setLoading] = useState(false)
  const [applyForm, setApplyForm] = useState({ employeeId: "", leaveTypeId: "", startDate: "", endDate: "", reason: "" })

  const pendingCount = requests?.filter((r: any) => r.status === "PENDING").length || 0
  const approvedCount = requests?.filter((r: any) => r.status === "APPROVED").length || 0
  const rejectedCount = requests?.filter((r: any) => r.status === "REJECTED").length || 0

  const filteredRequests = requests?.filter((r: any) => {
    const name = `${r.employee?.firstName || ""} ${r.employee?.lastName || ""}`.toLowerCase()
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || r.leaveType?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || r.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!applyForm.employeeId || !applyForm.leaveTypeId || !applyForm.startDate || !applyForm.endDate) {
      error("Validation Error", "Please fill in all required fields")
      return
    }
    setLoading(true)
    try {
      await api.post("/api/leave", applyForm)
      setShowApplyModal(false)
      setApplyForm({ employeeId: "", leaveTypeId: "", startDate: "", endDate: "", reason: "" })
      mutateRequests()
      success("Leave request submitted")
    } catch (err: any) {
      error("Submission failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    setLoading(true)
    try {
      await api.patch(`/api/leave/${id}`, { action })
      mutateRequests()
      success(`Leave ${action === "APPROVED" ? "approved" : "rejected"}`)
    } catch (err: any) {
      error("Update failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">{pendingCount} pending requests</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView("requests")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "requests" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}>Requests</button>
            <button onClick={() => setView("balances")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "balances" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}>Balances</button>
          </div>
          <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            <Plus size={16} />
            <span className="hidden sm:inline">Apply Leave</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending", value: pendingCount, color: "text-amber-600", icon: Clock },
          { label: "Approved", value: approvedCount, color: "text-green-600", icon: Check },
          { label: "Rejected", value: rejectedCount, color: "text-red-600", icon: XCircle },
          { label: "Total", value: requests?.length || 0, color: "text-indigo-600", icon: Calendar },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
          </div>
          <div className="space-y-3">
            {requests
              ?.filter((r: any) => r.status === "PENDING")
              .map((req: any) => (
                <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-amber-50 rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-medium flex-shrink-0">
                      {req.employee?.avatar || `${req.employee?.firstName?.[0] || ""}${req.employee?.lastName?.[0] || ""}`.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{req.employee?.firstName} {req.employee?.lastName}</div>
                      <div className="text-sm text-gray-600">{req.leaveType?.name} · {req.days}d · {formatDate(req.startDate)}</div>
                      <div className="text-sm text-gray-500 italic mt-0.5">"{req.reason}"</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <button onClick={() => handleAction(req.id, "APPROVED")} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                      <Check size={14} />
                      Approve
                    </button>
                    <button onClick={() => handleAction(req.id, "REJECTED")} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {view === "requests" ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by name or leave type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="All">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredRequests.map((req: any) => (
              <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-medium flex-shrink-0">
                      {req.employee?.avatar || `${req.employee?.firstName?.[0] || ""}${req.employee?.lastName?.[0] || ""}`.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{req.employee?.firstName} {req.employee?.lastName}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[req.status]}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">{req.leaveType?.name} · {req.days} day{req.days > 1 ? "s" : ""}</div>
                      <div className="text-sm text-gray-500">{formatDate(req.startDate)} — {formatDate(req.endDate)}</div>
                      <div className="text-sm text-gray-500 italic mt-0.5">"{req.reason}"</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-400">Applied</div>
                    <div className="text-sm text-gray-600">{formatDate(req.appliedOn)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No leave requests found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaveBalances?.map((balance: any) => (
            <div key={balance.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{balance.leaveType?.name?.[0] === "C" ? "🏖️" : balance.leaveType?.name?.[0] === "S" ? "🏥" : "⭐"}</span>
                <span className="font-medium text-gray-900">{balance.leaveType?.name}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium text-gray-900">{balance.total} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Used</span>
                  <span className="font-medium text-gray-900">{balance.used} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Remaining</span>
                  <span className="font-medium text-green-600">{balance.remaining} days</span>
                </div>
                <div className="pt-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${balance.total > 0 ? (balance.used / balance.total) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!leaveBalances || leaveBalances.length === 0) && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No leave balances found</p>
              <p className="text-sm mt-1">Balances will appear after initialization</p>
            </div>
          )}
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowApplyModal(false)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Apply for Leave</h2>
              <button onClick={() => setShowApplyModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleApply} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select value={applyForm.employeeId} onChange={(e) => setApplyForm({ ...applyForm, employeeId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required>
                  <option value="">Select employee</option>
                  {employees?.employees?.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select value={applyForm.leaveTypeId} onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required>
                  <option value="">Select leave type</option>
                  {leaveTypes?.map((lt: any) => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={applyForm.startDate} onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={applyForm.endDate} onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
              </div>
              {applyForm.startDate && applyForm.endDate && (
                <div className="p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700">
                  Total: {Math.ceil((new Date(applyForm.endDate).getTime() - new Date(applyForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={applyForm.reason} onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={3} placeholder="Reason for leave..." required />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowApplyModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
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
