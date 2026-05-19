import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")
    const status = searchParams.get("status")

    const where: any = { companyId: session.user.companyId }
    if (month) where.month = month
    if (year) where.year = parseInt(year)
    if (status) where.status = status

    const records = await prisma.payrollRecord.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, avatar: true, department: true, position: true } } },
      orderBy: { employee: { firstName: "asc" } },
    })

    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { employeeId, month, year, basicSalary, allowances, overtime, lop, latePenalty, tax, providentFund } = await request.json()

    if (!employeeId || !month || !year) {
      return NextResponse.json({ error: "employeeId, month, and year are required" }, { status: 400 })
    }

    const grossPay = (basicSalary || 0) + (allowances || 0) + (overtime || 0)
    const deductions = (lop || 0) + (latePenalty || 0) + (tax || 0) + (providentFund || 0)
    const netPay = grossPay - deductions

    const record = await prisma.payrollRecord.upsert({
      where: {
        employeeId_month_year: { employeeId, month, year: parseInt(year) },
      },
      create: {
        companyId: session.user.companyId,
        employeeId,
        month,
        year: parseInt(year),
        basicSalary: basicSalary || 0,
        allowances: allowances || 0,
        overtime: overtime || 0,
        lop: lop || 0,
        latePenalty: latePenalty || 0,
        tax: tax || 0,
        providentFund: providentFund || 0,
        deductions,
        grossPay,
        netPay,
        status: "DRAFT",
      },
      update: {
        basicSalary: basicSalary || 0,
        allowances: allowances || 0,
        overtime: overtime || 0,
        lop: lop || 0,
        latePenalty: latePenalty || 0,
        tax: tax || 0,
        providentFund: providentFund || 0,
        deductions,
        grossPay,
        netPay,
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error("POST /api/payroll error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
