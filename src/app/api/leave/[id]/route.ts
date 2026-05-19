import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { action, rejectionReason } = await request.json()

    if (!["APPROVED", "REJECTED", "CANCELLED"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const existing = await prisma.leaveRequest.findFirst({
      where: { id, companyId: session.user.companyId },
    })
    if (!existing) return NextResponse.json({ error: "Leave request not found" }, { status: 404 })

    if (existing.status !== "PENDING") {
      return NextResponse.json({ error: "Leave request is not pending" }, { status: 400 })
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: action,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        ...(action === "REJECTED" && { rejectionReason }),
      },
      include: { employee: true, leaveType: true },
    })

    if (action === "APPROVED") {
      await prisma.leaveBalance.updateMany({
        where: {
          employeeId: existing.employeeId,
          leaveTypeId: existing.leaveTypeId,
          year: new Date(existing.startDate).getFullYear(),
        },
        data: {
          used: { increment: existing.days },
          remaining: { decrement: existing.days },
        },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/leave/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
