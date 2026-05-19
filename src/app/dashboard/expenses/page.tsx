"use client"

import { useState } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import { Wallet, Plus, Eye, X, Check, XCircle, Clock, DollarSign, Calendar, Search, Upload, AlertCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ToastProvider"

const fetcher = (url: string): Promise<any> => api.get(url)

const categories = ["All", "Travel", "Equipment", "Software", "Training", "Meals", "Office Supplies", "Other"]
const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
}

export default function ExpensesPage() {
  const { data: session } = useSession()
  const { success, error } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showNewExpense, setShowNewExpense] = useState(false)
  const [showDetail, setShowDetail] = useState<any>(null)
  const [newExpense, setNewExpense] = useState({ category: "Travel", amount: "", date: "", description: "", receipt: false })
  const [loading, setLoading] = useState(false)

  const { data: expenses, mutate } = useSWR("/api/expenses", fetcher)

  const filteredExpenses = (expenses || []).filter((e: any) => {
    const name = `${e.employee?.firstName || ""} ${e.employee?.lastName || ""}`.toLowerCase()
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || e.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All" || e.category === categoryFilter
    const matchesStatus = statusFilter === "All" || e.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  }) || []

  const totalAmount = expenses?.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) || 0
  const pendingAmount = expenses?.filter((e: any) => e.status === "PENDING").reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) || 0
  const approvedAmount = expenses?.filter((e: any) => e.status === "APPROVED").reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) || 0
  const rejectedAmount = expenses?.filter((e: any) => e.status === "REJECTED").reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) || 0

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    setLoading(true)
    try {
      await api.patch(`/api/expenses/${id}`, { action })
      mutate()
      success(`Expense ${action === "APPROVED" ? "approved" : "rejected"}`)
    } catch (error: any) {
      error(error?.message || "Failed to update expense")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExpense.amount || !newExpense.date || !newExpense.description) {
      error("Validation Error", "Please fill in all required fields")
      return
    }
    setLoading(true)
    try {
      const employeeId = expenses?.[0]?.employeeId || session?.user?.id
      await api.post("/api/expenses", {
        employeeId,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        description: newExpense.description,
        receipt: newExpense.receipt,
      })
      mutate()
      setShowNewExpense(false)
      setNewExpense({ category: "Travel", amount: "", date: "", description: "", receipt: false })
      success("Expense submitted successfully")
    } catch (err: any) {
      error("Submission failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `NPR ${amount.toLocaleString()}`

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Expense Claims</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">{expenses?.filter((e: any) => e.status === "PENDING").length || 0} pending claims</p>
        </div>
        <button
          onClick={() => setShowNewExpense(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          <Plus size={16} />
          Submit Expense
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <span className="text-sm text-gray-500">Total Claims</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
          <div className="text-sm text-gray-500 mt-1">{expenses?.length || 0} claims</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</div>
          <div className="text-sm text-gray-500 mt-1">{expenses?.filter((e: any) => e.status === "PENDING").length || 0} claims</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Approved</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(approvedAmount)}</div>
          <div className="text-sm text-gray-500 mt-1">{expenses?.filter((e: any) => e.status === "APPROVED").length || 0} claims</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-500">Rejected</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(rejectedAmount)}</div>
          <div className="text-sm text-gray-500 mt-1">{expenses?.filter((e: any) => e.status === "REJECTED").length || 0} claims</div>
        </div>
      </div>

      {expenses?.filter((e: any) => e.status === "PENDING").length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Pending Approvals</h2>
          <div className="space-y-3">
            {expenses
              .filter((e: any) => e.status === "PENDING")
              .map((exp: any) => (
                <div key={exp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-amber-50 rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-medium flex-shrink-0">
                      {exp.employee?.avatar || `${exp.employee?.firstName?.[0] || ""}${exp.employee?.lastName?.[0] || ""}`.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{exp.employee?.firstName} {exp.employee?.lastName}</div>
                      <div className="text-sm text-gray-600">{exp.category} · {formatCurrency(Number(exp.amount))} · {new Date(exp.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500 italic mt-0.5">"{exp.description}"</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <button onClick={() => handleAction(exp.id, "APPROVED")} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                      <Check size={14} />
                      Approve
                    </button>
                    <button onClick={() => handleAction(exp.id, "REJECTED")} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredExpenses.map((exp: any) => (
            <div key={exp.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-medium flex-shrink-0">
                    {exp.employee?.avatar || `${exp.employee?.firstName?.[0] || ""}${exp.employee?.lastName?.[0] || ""}`.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{exp.employee?.firstName} {exp.employee?.lastName}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[exp.status]}`}>
                        {exp.status.charAt(0) + exp.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5">{exp.category} · {formatCurrency(Number(exp.amount))}</div>
                    <div className="text-sm text-gray-500">{new Date(exp.date).toLocaleDateString()} · {exp.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {exp.receipt && <span className="text-xs text-gray-400 flex items-center gap-1"><Upload size={12} /> Receipt</span>}
                  <button onClick={() => setShowDetail(exp)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No expenses found</p>
            <p className="text-sm mt-1">Submit an expense claim to get started</p>
          </div>
        )}
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetail(null)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Expense Details</h2>
              <button onClick={() => setShowDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                  {showDetail.employee?.avatar || `${showDetail.employee?.firstName?.[0] || ""}${showDetail.employee?.lastName?.[0] || ""}`.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{showDetail.employee?.firstName} {showDetail.employee?.lastName}</h3>
                  <p className="text-sm text-gray-500">{showDetail.category}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="font-semibold text-lg">{formatCurrency(Number(showDetail.amount))}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(showDetail.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[showDetail.status]}`}>{showDetail.status.charAt(0) + showDetail.status.slice(1).toLowerCase()}</span></div>
                <div><span className="text-gray-500 text-sm">Description</span><p className="text-sm mt-1">{showDetail.description}</p></div>
                <div className="flex items-center gap-2 text-sm"><Upload size={14} className="text-gray-400" /><span className={showDetail.receipt ? "text-green-600" : "text-gray-400"}>{showDetail.receipt ? "Receipt attached" : "No receipt"}</span></div>
                {showDetail.reviewedAt && <div className="text-sm text-gray-500">Reviewed on {new Date(showDetail.reviewedAt).toLocaleDateString()}</div>}
              </div>

              {showDetail.status === "PENDING" && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button onClick={() => { handleAction(showDetail.id, "APPROVED"); setShowDetail(null) }} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                    <Check size={16} />
                    Approve
                  </button>
                  <button onClick={() => { handleAction(showDetail.id, "REJECTED"); setShowDetail(null) }} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewExpense && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewExpense(false)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Submit Expense</h2>
              <button onClick={() => setShowNewExpense(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {categories.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NPR)</label>
                  <input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={3} placeholder="What was this expense for?" required />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={newExpense.receipt} onChange={(e) => setNewExpense({ ...newExpense, receipt: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-gray-600">Receipt attached</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowNewExpense(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
