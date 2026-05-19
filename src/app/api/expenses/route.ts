import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    const where: any = { companyId: session.user.companyId }
    if (status) where.status = status
    if (category) where.category = category

    const expenses = await prisma.expenseClaim.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, avatar: true, department: true } } },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { employeeId, category, amount, date, description, receipt } = await request.json()

    if (!employeeId || !category || !amount || !date || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const expense = await prisma.expenseClaim.create({
      data: {
        companyId: session.user.companyId,
        employeeId,
        category,
        amount: parseFloat(amount),
        date: new Date(date),
        description,
        receipt: receipt || false,
        status: "PENDING",
      },
      include: { employee: true },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
