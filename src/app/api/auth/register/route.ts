import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, company } = body

    if (!name || !email || !password || !company) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const newCompany = await prisma.company.create({
      data: {
        name: company,
        timezone: "UTC",
        currency: "USD",
        fiscalYearStart: "January",
        workDaysPerWeek: 5,
        workStartTime: "09:00",
        workEndTime: "18:00",
      },
    })

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "SUPER_ADMIN",
        companyId: newCompany.id,
      },
    })

    await prisma.employee.create({
      data: {
        userId: user.id,
        companyId: newCompany.id,
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        email,
        position: "CEO",
        salary: 0,
        joinDate: new Date(),
        status: "ACTIVE",
      },
    })

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
