import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cycle = searchParams.get("cycle")
    const status = searchParams.get("status")

    const where: any = { companyId: session.user.companyId }
    if (cycle) where.cycle = cycle
    if (status) where.status = status

    const reviews = await prisma.performanceReview.findMany({
      where,
      include: {
        employee: { select: { firstName: true, lastName: true, avatar: true, department: true, position: true } },
        goals: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { employeeId, cycle, goals, comments } = await request.json()

    if (!employeeId || !cycle) {
      return NextResponse.json({ error: "employeeId and cycle are required" }, { status: 400 })
    }

    const review = await prisma.performanceReview.create({
      data: {
        companyId: session.user.companyId,
        employeeId,
        cycle,
        status: "PENDING",
        comments,
        goals: {
          create: goals?.map((g: { name: string; status: string }) => ({
            name: g.name,
            status: g.status || "IN_PROGRESS",
          })) || [],
        },
      },
      include: { employee: true, goals: true },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
