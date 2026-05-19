import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const employee = await prisma.employee.findFirst({
      where: { id, companyId: session.user.companyId },
      include: { department: true },
    })

    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 })

    return NextResponse.json(employee)
  } catch (error) {
    console.error("GET /api/employees/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.employee.findFirst({
      where: { id, companyId: session.user.companyId },
    })
    if (!existing) return NextResponse.json({ error: "Employee not found" }, { status: 404 })

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.email && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.departmentId !== undefined && { departmentId: body.departmentId }),
        ...(body.position && { position: body.position }),
        ...(body.salary !== undefined && { salary: parseFloat(body.salary) }),
        ...(body.joinDate && { joinDate: new Date(body.joinDate) }),
        ...(body.status && { status: body.status }),
        avatar: body.firstName || body.lastName
          ? `${(body.firstName || existing.firstName)[0]}${(body.lastName || existing.lastName)[0]}`.toUpperCase()
          : existing.avatar,
      },
      include: { department: true },
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error("PUT /api/employees/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const existing = await prisma.employee.findFirst({
      where: { id, companyId: session.user.companyId },
    })
    if (!existing) return NextResponse.json({ error: "Employee not found" }, { status: 404 })

    await prisma.employee.delete({ where: { id } })

    return NextResponse.json({ message: "Employee deleted" })
  } catch (error) {
    console.error("DELETE /api/employees/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
