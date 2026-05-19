"use client"

import { useState } from "react"
import useSWR from "swr"
import { Download, FileText, BarChart3, TrendingUp, Users, DollarSign, Calendar, ChevronDown } from "lucide-react"
import { api } from "@/lib/api"

const fetcher = (url: string): Promise<any> => api.get(url)

const reportCategories = [
  {
    name: "HR Reports",
    icon: Users,
    reports: [
      { id: "employee-list", title: "Employee List", description: "Complete list of all employees with details", format: ["CSV", "PDF"] },
      { id: "department-summary", title: "Department Summary", description: "Headcount and salary by department", format: ["CSV", "PDF"] },
      { id: "new-joiners", title: "New Joiners Report", description: "Employees who joined in selected period", format: ["CSV"] },
      { id: "exit-report", title: "Exit Report", description: "Employees who left the organization", format: ["CSV", "PDF"] },
    ],
  },
  {
    name: "Attendance Reports",
    icon: Calendar,
    reports: [
      { id: "monthly-attendance", title: "Monthly Attendance", description: "Daily attendance summary for all employees", format: ["CSV", "PDF"] },
      { id: "late-report", title: "Late Coming Report", description: "Employees with late check-ins", format: ["CSV"] },
      { id: "absence-report", title: "Absence Report", description: "Unmarked and absent days", format: ["CSV", "PDF"] },
    ],
  },
  {
    name: "Leave Reports",
    icon: FileText,
    reports: [
      { id: "leave-balance", title: "Leave Balance Report", description: "Current leave balances for all employees", format: ["CSV", "PDF"] },
      { id: "leave-history", title: "Leave History", description: "All leave requests in selected period", format: ["CSV"] },
      { id: "leave-trend", title: "Leave Trend Analysis", description: "Monthly leave patterns and trends", format: ["PDF"] },
    ],
  },
  {
    name: "Payroll Reports",
    icon: DollarSign,
    reports: [
      { id: "payroll-summary", title: "Payroll Summary", description: "Monthly payroll breakdown", format: ["CSV", "PDF"] },
      { id: "salary-register", title: "Salary Register", description: "Detailed salary components for all employees", format: ["CSV"] },
      { id: "tax-report", title: "Tax Report", description: "Tax deductions and summaries", format: ["CSV", "PDF"] },
      { id: "lop-report", title: "LOP Report", description: "Loss of pay calculations and details", format: ["CSV"] },
    ],
  },
]

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [dateRange, setDateRange] = useState("this-month")

  const { data: summary } = useSWR("/api/reports?type=summary", fetcher)
  const { data: attendanceTrend } = useSWR("/api/reports?type=attendance-trend", fetcher)
  const { data: payrollTrend } = useSWR("/api/reports?type=payroll-trend", fetcher)

  const avgAttendance = summary?.attendanceThisMonth ? Math.round((summary.attendanceThisMonth / ((summary.totalEmployees || 1) * 22)) * 100) : 89

  const monthlyTrends: { month: string; employees: number; attendance: number; leave: number; payroll: number }[] = payrollTrend?.slice(0, 5).reverse().map((t: any) => ({
    month: new Date(t.year, parseInt(t.month) - 1).toLocaleDateString("en-US", { month: "short" }),
    employees: summary?.totalEmployees || 0,
    attendance: avgAttendance,
    leave: summary?.pendingLeaves || 0,
    payroll: t._sum?.netPay || 0,
  })) || [
    { month: "Jan", employees: summary?.totalEmployees || 0, attendance: avgAttendance, leave: 3, payroll: 280000 },
    { month: "Feb", employees: summary?.totalEmployees || 0, attendance: avgAttendance - 2, leave: 5, payroll: 280000 },
    { month: "Mar", employees: summary?.totalEmployees || 0, attendance: avgAttendance + 2, leave: 2, payroll: 310000 },
    { month: "Apr", employees: summary?.totalEmployees || 0, attendance: avgAttendance - 1, leave: 4, payroll: 335000 },
    { month: "May", employees: summary?.totalEmployees || 0, attendance: avgAttendance, leave: summary?.pendingLeaves || 0, payroll: summary?.payrollThisMonth || 340000 },
  ]

  const maxPayroll = Math.max(...monthlyTrends.map((t) => t.payroll), 1)

  const formatCurrency = (amount: number) => amount >= 1000 ? `NPR ${(amount / 1000).toFixed(0)}K` : `NPR ${amount.toLocaleString()}`

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Generate and export HR reports</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="text-sm text-gray-500">Total Employees</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary?.totalEmployees || 0}</div>
          <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp size={14} />
            {summary?.activeEmployees || 0} active
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Avg Attendance</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgAttendance}%</div>
          <div className="text-sm text-gray-500 mt-1">{summary?.attendanceThisMonth || 0} records this month</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-gray-500">Pending Items</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{(summary?.pendingLeaves || 0) + (summary?.pendingExpenses || 0)}</div>
          <div className="text-sm text-amber-600 mt-1">{summary?.pendingLeaves || 0} leaves, {summary?.pendingExpenses || 0} expenses</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-500">Monthly Payroll</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.payrollThisMonth || 0)}</div>
          <div className="text-sm text-gray-500 mt-1">{summary?.departments || 0} departments</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">5-Month Trends</h2>
        <div className="space-y-3">
          {monthlyTrends.map((trend) => (
            <div key={trend.month} className="flex items-center gap-4">
              <div className="w-10 text-sm font-medium text-gray-600">{trend.month}</div>
              <div className="flex-1 grid grid-cols-4 gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${Math.min((trend.employees / Math.max(summary?.totalEmployees || 7, 1)) * 100, 100)}%` }}></div>
                  <span className="text-xs text-gray-500">{trend.employees}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: `${trend.attendance}%` }}></div>
                  <span className="text-xs text-gray-500">{trend.attendance}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-amber-500 rounded-full" style={{ width: `${Math.min((trend.leave / 10) * 100, 100)}%` }}></div>
                  <span className="text-xs text-gray-500">{trend.leave}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${(trend.payroll / maxPayroll) * 100}%` }}></div>
                  <span className="text-xs text-gray-500">{formatCurrency(trend.payroll)}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <div className="w-10"></div>
            <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
              <span>Employees</span>
              <span>Attendance</span>
              <span>Leaves</span>
              <span>Payroll</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reportCategories.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.name}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-900">{category.name}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {category.reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-2">
                      <FileText className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      <div className="flex gap-1">
                        {report.format.map((fmt) => (
                          <button
                            key={fmt}
                            className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                          >
                            <Download size={10} />
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm">{report.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
