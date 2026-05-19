import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const departments = await prisma.department.findMany({
      where: { companyId: session.user.companyId },
      include: { _count: { select: { employees: true } } },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(departments)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, description } = await request.json()
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })

    const department = await prisma.department.create({
      data: { companyId: session.user.companyId, name, description },
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
