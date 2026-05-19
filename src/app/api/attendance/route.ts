import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const employeeId = searchParams.get("employeeId")

    const where: any = { companyId: session.user.companyId }
    if (date) where.date = new Date(date)
    if (employeeId) where.employeeId = employeeId

    const attendance = await prisma.attendance.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, avatar: true, department: true } } },
      orderBy: [{ date: "desc" }, { employee: { firstName: "asc" } }],
    })

    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { employeeId, date, checkIn, checkOut, status, notes } = await request.json()

    if (!employeeId || !date) {
      return NextResponse.json({ error: "employeeId and date are required" }, { status: 400 })
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
      create: {
        companyId: session.user.companyId,
        employeeId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status: status || "NOT_MARKED",
        notes,
        workingHours: 0,
      },
      update: {
        ...(checkIn && { checkIn: new Date(checkIn) }),
        ...(checkOut && { checkOut: new Date(checkOut) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("POST /api/attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
