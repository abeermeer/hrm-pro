import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "summary"

    if (type === "summary") {
      const [totalEmployees, activeEmployees, departments, attendanceThisMonth, pendingLeaves, pendingExpenses, payrollThisMonth] = await Promise.all([
        prisma.employee.count({ where: { companyId: session.user.companyId } }),
        prisma.employee.count({ where: { companyId: session.user.companyId, status: "ACTIVE" } }),
        prisma.department.count({ where: { companyId: session.user.companyId } }),
        prisma.attendance.count({
          where: {
            companyId: session.user.companyId,
            date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        }),
        prisma.leaveRequest.count({ where: { companyId: session.user.companyId, status: "PENDING" } }),
        prisma.expenseClaim.count({ where: { companyId: session.user.companyId, status: "PENDING" } }),
        prisma.payrollRecord.aggregate({
          where: {
            companyId: session.user.companyId,
            month: String(new Date().getMonth() + 1).padStart(2, "0"),
            year: new Date().getFullYear(),
          },
          _sum: { netPay: true },
        }),
      ])

      return NextResponse.json({
        totalEmployees,
        activeEmployees,
        departments,
        attendanceThisMonth,
        pendingLeaves,
        pendingExpenses,
        payrollThisMonth: payrollThisMonth._sum.netPay || 0,
      })
    }

    if (type === "attendance-trend") {
      const trends = await prisma.attendance.groupBy({
        by: ["status"],
        where: { companyId: session.user.companyId },
        _count: true,
      })
      return NextResponse.json(trends)
    }

    if (type === "payroll-trend") {
      const trends = await prisma.payrollRecord.groupBy({
        by: ["month", "year"],
        where: { companyId: session.user.companyId, status: "PAID" },
        _sum: { netPay: true },
        _count: true,
        orderBy: [{ year: "desc" }, { month: "desc" }],
      })
      return NextResponse.json(trends)
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  } catch (error) {
    console.error("GET /api/reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
