import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const department = searchParams.get("department") || ""
    const status = searchParams.get("status") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: any = { companyId: session.user.companyId }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { position: { contains: search } },
      ]
    }
    if (department) where.departmentId = department
    if (status) where.status = status

    const total = await prisma.employee.count({ where })
    const employees = await prisma.employee.findMany({
      where,
      include: { department: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({
      employees,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("GET /api/employees error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { firstName, lastName, email, phone, departmentId, position, salary, joinDate, status } = body

    if (!firstName || !lastName || !email || !position || !salary || !joinDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const employee = await prisma.employee.create({
      data: {
        companyId: session.user.companyId,
        firstName,
        lastName,
        email,
        phone,
        departmentId: departmentId || null,
        position,
        salary: parseFloat(salary),
        joinDate: new Date(joinDate),
        status: status || "ACTIVE",
        avatar: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      },
      include: { department: true },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("POST /api/employees error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
