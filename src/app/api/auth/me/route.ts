import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: {
      department: true,
      company: true,
    },
  })

  return NextResponse.json({
    user: session.user,
    employee,
  })
}
