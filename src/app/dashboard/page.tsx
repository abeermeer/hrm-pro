"use client"

import useSWR from "swr"
import { Users, DollarSign, CheckCircle, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { api } from "@/lib/api"

const fetcher = (url: string): Promise<any> => api.get(url)

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useSWR("/api/reports?type=summary", fetcher)
  const { data: attendance, isLoading: attendanceLoading } = useSWR("/api/attendance", fetcher)
  const { data: leaveRequests, isLoading: leaveLoading } = useSWR("/api/leave?status=PENDING", fetcher)
  const { data: payroll, isLoading: payrollLoading } = useSWR("/api/payroll", fetcher)

  if (statsLoading || attendanceLoading || leaveLoading || payrollLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const attendanceStats = {
    present: attendance?.filter((a: any) => a.status === "PRESENT" || a.status === "LATE").length || 0,
    absent: attendance?.filter((a: any) => a.status === "ABSENT").length || 0,
    onLeave: attendance?.filter((a: any) => a.status === "ON_LEAVE").length || 0,
    notMarked: stats?.totalEmployees - (attendance?.length || 0) || 0,
  }

  const pendingApprovals = leaveRequests?.slice(0, 5) || []
  const payrollRecords = payroll?.slice(0, 5) || []

  const statsCards = [
    {
      title: "Active Employees",
      value: stats?.activeEmployees?.toString() || "0",
      change: `${stats?.totalEmployees || 0} total`,
      trend: "up",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Net Payroll",
      value: `NPR ${(stats?.payrollThisMonth || 0).toLocaleString()}`,
      change: "This month",
      trend: "neutral",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending Leaves",
      value: (stats?.pendingLeaves || 0).toString(),
      change: "Requires action",
      trend: stats?.pendingLeaves > 0 ? "down" : "neutral",
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Pending Expenses",
      value: (stats?.pendingExpenses || 0).toString(),
      change: "Requires review",
      trend: stats?.pendingExpenses > 0 ? "down" : "neutral",
      icon: CheckCircle,
      color: "bg-purple-50 text-purple-600",
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Welcome back!</p>
        </div>
        <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="hidden sm:inline">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm text-gray-500">{stat.title}</span>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={16} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm">
              {stat.trend === "up" && <ArrowUpRight size={12} className="text-green-500" />}
              {stat.trend === "down" && <ArrowDownRight size={12} className="text-red-500" />}
              <span className="text-gray-500">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Today's Attendance</h2>
            <a href="/dashboard/attendance" className="text-sm text-indigo-600 hover:underline">View all →</a>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Present</span>
              <span className="text-lg font-semibold text-green-600">{attendanceStats.present}</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-600">Absent</span>
              <span className="text-lg font-semibold text-red-600">{attendanceStats.absent}</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">On Leave</span>
              <span className="text-lg font-semibold text-blue-600">{attendanceStats.onLeave}</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Not Marked</span>
              <span className="text-lg font-semibold text-gray-600">{attendanceStats.notMarked}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
            <a href="/dashboard/leave" className="text-sm text-indigo-600 hover:underline">View all →</a>
          </div>
          {pendingApprovals.length > 0 ? (
            <div className="space-y-3">
              {pendingApprovals.map((approval: any) => (
                <div key={approval.id} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{approval.employee?.firstName} {approval.employee?.lastName}</div>
                      <div className="text-sm text-gray-500">{approval.leaveType?.name} · {approval.days}d · {new Date(approval.startDate).toLocaleDateString()}</div>
                    </div>
                    <a href="/dashboard/leave" className="text-sm text-indigo-600 font-medium hover:underline">Review</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">No pending approvals</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Payroll Status</h2>
            <a href="/dashboard/payroll" className="text-sm text-indigo-600 hover:underline">View all →</a>
          </div>
          {payrollRecords.length > 0 ? (
            <div className="space-y-2">
              {payrollRecords.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{record.employee?.firstName} {record.employee?.lastName}</div>
                    <div className="text-sm text-gray-500">NPR {record.netPay?.toLocaleString()}</div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    record.status === "PAID" ? "bg-green-100 text-green-700" :
                    record.status === "APPROVED" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">No payroll records</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a href="/dashboard/employees?new=true" className="p-3 sm:p-4 border border-gray-200 rounded-lg text-center hover:border-indigo-200 hover:bg-indigo-50 transition-all">
            <div className="text-xl sm:text-2xl mb-1">+</div>
            <div className="text-xs sm:text-sm font-medium text-gray-700">Add Employee</div>
          </a>
          <a href="/dashboard/attendance" className="p-3 sm:p-4 border border-gray-200 rounded-lg text-center hover:border-indigo-200 hover:bg-indigo-50 transition-all">
            <div className="text-xl sm:text-2xl mb-1">✓</div>
            <div className="text-xs sm:text-sm font-medium text-gray-700">Mark Attendance</div>
          </a>
          <a href="/dashboard/payroll" className="p-3 sm:p-4 border border-gray-200 rounded-lg text-center hover:border-indigo-200 hover:bg-indigo-50 transition-all">
            <div className="text-xl sm:text-2xl mb-1">$</div>
            <div className="text-xs sm:text-sm font-medium text-gray-700">Generate Payroll</div>
          </a>
          <a href="/dashboard/leave" className="p-3 sm:p-4 border border-gray-200 rounded-lg text-center hover:border-indigo-200 hover:bg-indigo-50 transition-all">
            <div className="text-xl sm:text-2xl mb-1">📅</div>
            <div className="text-xs sm:text-sm font-medium text-gray-700">Apply Leave</div>
          </a>
        </div>
      </div>
    </div>
  )
}
