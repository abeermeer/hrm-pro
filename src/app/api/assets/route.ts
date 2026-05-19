import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: any = { companyId: session.user.companyId }
    if (status) where.status = status

    const assets = await prisma.asset.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(assets)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, type, serialNumber, purchaseDate, warrantyExpiry, value, status, condition } = await request.json()

    if (!name || !type || !serialNumber || !purchaseDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const asset = await prisma.asset.create({
      data: {
        companyId: session.user.companyId,
        name,
        type,
        serialNumber,
        purchaseDate: new Date(purchaseDate),
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        value: value ? parseFloat(value) : 0,
        status: status || "AVAILABLE",
        condition: condition || "GOOD",
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
