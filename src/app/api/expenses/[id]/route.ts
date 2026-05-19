import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { action } = await request.json()

    if (!["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const existing = await prisma.expenseClaim.findFirst({
      where: { id, companyId: session.user.companyId },
    })
    if (!existing) return NextResponse.json({ error: "Expense not found" }, { status: 404 })

    const expense = await prisma.expenseClaim.update({
      where: { id },
      data: {
        status: action,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
