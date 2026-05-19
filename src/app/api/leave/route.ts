import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const employeeId = searchParams.get("employeeId")

    const where: any = { companyId: session.user.companyId }
    if (status) where.status = status
    if (employeeId) where.employeeId = employeeId

    const requests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: { select: { firstName: true, lastName: true, avatar: true, department: true } },
        leaveType: true,
      },
      orderBy: { appliedOn: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { employeeId, leaveTypeId, startDate, endDate, reason } = await request.json()

    if (!employeeId || !leaveTypeId || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        companyId: session.user.companyId,
        employeeId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        days,
        reason,
        status: "PENDING",
      },
      include: { employee: true, leaveType: true },
    })

    return NextResponse.json(leaveRequest, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
