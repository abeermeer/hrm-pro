import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { action, employeeId } = await request.json()

    const existing = await prisma.asset.findFirst({
      where: { id, companyId: session.user.companyId },
    })
    if (!existing) return NextResponse.json({ error: "Asset not found" }, { status: 404 })

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        ...(action === "assign" && { status: "ASSIGNED", employeeId }),
        ...(action === "unassign" && { status: "AVAILABLE", employeeId: null }),
        ...(action === "maintenance" && { status: "MAINTENANCE" }),
        ...(action === "retire" && { status: "RETIRED", employeeId: null }),
      },
    })

    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
