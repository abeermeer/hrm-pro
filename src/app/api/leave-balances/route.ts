import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

    const where: any = { companyId: session.user.companyId, year }
    if (employeeId) where.employeeId = employeeId

    const balances = await prisma.leaveBalance.findMany({
      where,
      include: {
        employee: { select: { firstName: true, lastName: true, avatar: true } },
        leaveType: true,
      },
    })

    return NextResponse.json(balances)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
