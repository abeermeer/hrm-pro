"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Eye,
  Search,
  X,
  Printer,
  Calculator,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ToastProvider"

const fetcher = (url: string): Promise<any> => api.get(url)

const months = [
  { value: "05", label: "May 2026" },
  { value: "04", label: "April 2026" },
  { value: "03", label: "March 2026" },
  { value: "02", label: "February 2026" },
  { value: "01", label: "January 2026" },
]

export default function PayrollPage() {
  const { success, error } = useToast()
  const [selectedMonth, setSelectedMonth] = useState("05")
  const [selectedYear] = useState(2026)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showPayslip, setShowPayslip] = useState<any>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: records, mutate } = useSWR(`/api/payroll?month=${selectedMonth}&year=${selectedYear}`, fetcher)
  const { data: employees } = useSWR("/api/employees?limit=100", fetcher)

  const filteredRecords = (records || []).filter((r: any) => {
    const name = `${r.employee?.firstName || ""} ${r.employee?.lastName || ""}`.toLowerCase()
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || r.employee?.department?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || r.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const totalGross = records?.reduce((sum: number, r: any) => sum + (r.grossPay || 0), 0) || 0
  const totalDeductions = records?.reduce((sum: number, r: any) => sum + (r.deductions || 0), 0) || 0
  const totalNet = records?.reduce((sum: number, r: any) => sum + (r.netPay || 0), 0) || 0
  const paidCount = records?.filter((r: any) => r.status === "PAID").length || 0
  const pendingCount = records?.filter((r: any) => r.status !== "PAID").length || 0

  const handleGeneratePayroll = async () => {
    setLoading(true)
    try {
      await api.post("/api/payroll/generate", { month: selectedMonth, year: selectedYear })
      mutate()
      setShowGenerateModal(false)
      success("Payroll generated successfully")
    } catch (err: any) {
      error("Generation failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (id: string) => {
    setLoading(true)
    try {
      await api.patch(`/api/payroll/${id}`, { status: "PAID" })
      mutate()
      success("Marked as paid")
    } catch (err: any) {
      error("Update failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllPaid = async () => {
    setLoading(true)
    try {
      for (const record of records?.filter((r: any) => r.status !== "PAID") || []) {
        await api.patch(`/api/payroll/${record.id}`, { status: "PAID" })
      }
      mutate()
      success("All payroll records marked as paid")
    } catch (err: any) {
      error("Update failed", err?.message || "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `NPR ${amount.toLocaleString()}`

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    APPROVED: "bg-amber-100 text-amber-700",
    PAID: "bg-green-100 text-green-700",
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">{months.find((m) => m.value === selectedMonth)?.label}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            <Calculator size={16} />
            <span className="hidden sm:inline">Generate Payroll</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { title: "Gross Earnings", value: formatCurrency(totalGross), subtitle: `${records?.length || 0} employees`, icon: TrendingUp, color: "bg-green-50 text-green-600" },
          { title: "Total Deductions", value: formatCurrency(totalDeductions), subtitle: "Tax, PF, LOP, Late", icon: TrendingDown, color: "bg-red-50 text-red-600" },
          { title: "Net Payable", value: formatCurrency(totalNet), subtitle: "After deductions", icon: DollarSign, color: "bg-indigo-50 text-indigo-600" },
          { title: "Payment Status", value: `${paidCount} / ${records?.length || 0}`, subtitle: `${pendingCount} pending`, icon: CheckCircle, color: "bg-green-50 text-green-600" },
        ].map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.title}</span>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <div className="font-medium text-amber-900">{pendingCount} payroll(s) pending payment</div>
              <div className="text-sm text-amber-700">Review and mark as paid to complete the payroll cycle.</div>
            </div>
          </div>
          <button onClick={handleMarkAllPaid} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 flex-shrink-0 disabled:opacity-50">
            <CheckCircle size={16} />
            Mark All Paid
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by name or department..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="All">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PROCESSING">Processing</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Basic</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Allowances</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Overtime</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden md:table-cell">LOP</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Deductions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record: any) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-medium flex-shrink-0">
                        {record.employee?.avatar || `${record.employee?.firstName?.[0] || ""}${record.employee?.lastName?.[0] || ""}`.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{record.employee?.firstName} {record.employee?.lastName}</div>
                        <div className="text-sm text-gray-500">{record.employee?.department?.name || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right hidden lg:table-cell">{formatCurrency(record.basicSalary || 0)}</td>
                  <td className="px-4 py-3 text-sm text-right hidden lg:table-cell">{formatCurrency(record.allowances || 0)}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 hidden md:table-cell">{record.overtime > 0 ? `+${formatCurrency(record.overtime)}` : "—"}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600 hidden md:table-cell">{record.lop > 0 ? `-${formatCurrency(record.lop)}` : "—"}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600 hidden md:table-cell">-{formatCurrency(record.deductions || 0)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-right">{formatCurrency(record.netPay || 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[record.status]}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setShowPayslip(record)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="View Payslip">
                        <Eye size={16} />
                      </button>
                      {record.status !== "PAID" && (
                        <button onClick={() => handleMarkPaid(record.id)} disabled={loading} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 disabled:opacity-50" title="Mark as Paid">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Download PDF">
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No payroll records found</p>
            <p className="text-sm mt-1">Generate payroll for this month to get started</p>
          </div>
        )}
      </div>

      {showPayslip && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowPayslip(null)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Payslip — {months.find((m) => m.value === selectedMonth)?.label}</h2>
              <button onClick={() => setShowPayslip(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-lg font-bold">
                  {showPayslip.employee?.avatar || `${showPayslip.employee?.firstName?.[0] || ""}${showPayslip.employee?.lastName?.[0] || ""}`.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{showPayslip.employee?.firstName} {showPayslip.employee?.lastName}</h3>
                  <p className="text-gray-500">{showPayslip.employee?.position} · {showPayslip.employee?.department?.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Earnings</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Basic Salary</span><span className="font-medium">{formatCurrency(showPayslip.basicSalary || 0)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Allowances</span><span className="font-medium">{formatCurrency(showPayslip.allowances || 0)}</span></div>
                    {showPayslip.overtime > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">Overtime</span><span className="font-medium text-green-600">+{formatCurrency(showPayslip.overtime)}</span></div>}
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100"><span>Gross Pay</span><span>{formatCurrency(showPayslip.grossPay || 0)}</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Deductions</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Income Tax</span><span className="font-medium text-red-600">-{formatCurrency(showPayslip.tax || 0)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Provident Fund (10%)</span><span className="font-medium text-red-600">-{formatCurrency(showPayslip.providentFund || 0)}</span></div>
                    {showPayslip.lop > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">Loss of Pay (LOP)</span><span className="font-medium text-red-600">-{formatCurrency(showPayslip.lop)}</span></div>}
                    {showPayslip.latePenalty > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">Late Penalty</span><span className="font-medium text-red-600">-{formatCurrency(showPayslip.latePenalty)}</span></div>}
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100"><span>Total Deductions</span><span className="text-red-600">-{formatCurrency(showPayslip.deductions || 0)}</span></div>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-indigo-900">Net Pay</span>
                    <span className="text-2xl font-bold text-indigo-700">{formatCurrency(showPayslip.netPay || 0)}</span>
                  </div>
                </div>

                {showPayslip.paymentDate && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle size={16} />
                    Paid on {new Date(showPayslip.paymentDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                  <Printer size={16} />
                  Print
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowGenerateModal(false)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-md">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Generate Payroll</h2>
              <button onClick={() => setShowGenerateModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-4 sm:p-5">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-900">Review before generating</div>
                    <div className="text-sm text-amber-700 mt-1">
                      Payroll will be calculated based on attendance, leave, and overtime data for {months.find((m) => m.value === selectedMonth)?.label}.
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Employees</span><span className="font-medium">{employees?.employees?.length || 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Estimated Gross</span><span className="font-medium">{formatCurrency(totalGross)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Estimated Deductions</span><span className="font-medium text-red-600">{formatCurrency(totalDeductions)}</span></div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100"><span>Estimated Net Payable</span><span className="text-indigo-600">{formatCurrency(totalNet)}</span></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowGenerateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={handleGeneratePayroll} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Generating..." : "Generate & Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
