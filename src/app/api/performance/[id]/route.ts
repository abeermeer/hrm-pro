import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { selfRating, managerRating, finalRating, status, goals, comments } = await request.json()

    const existing = await prisma.performanceReview.findFirst({
      where: { id, companyId: session.user.companyId },
    })
    if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 })

    const review = await prisma.performanceReview.update({
      where: { id },
      data: {
        ...(selfRating !== undefined && { selfRating }),
        ...(managerRating !== undefined && { managerRating }),
        ...(finalRating !== undefined && { finalRating }),
        ...(status && { status }),
        ...(comments !== undefined && { comments }),
        ...(status === "COMPLETED" && { reviewDate: new Date() }),
        ...(goals && {
          goals: {
            deleteMany: {},
            create: goals.map((g: { name: string; status: string }) => ({
              name: g.name,
              status: g.status || "IN_PROGRESS",
            })),
          },
        }),
      },
      include: { employee: true, goals: true },
    })

    return NextResponse.json(review)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
