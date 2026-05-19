import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { status } = await request.json()

    if (!["DRAFT", "PROCESSING", "APPROVED", "PAID"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const existing = await prisma.payrollRecord.findFirst({
      where: { id, companyId: session.user.companyId },
    })
    if (!existing) return NextResponse.json({ error: "Payroll record not found" }, { status: 404 })

    const record = await prisma.payrollRecord.update({
      where: { id },
      data: {
        status,
        ...(status === "PAID" && { paymentDate: new Date() }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
