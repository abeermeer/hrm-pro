import { PrismaClient, Prisma } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  const company = await prisma.company.create({
    data: {
      name: "Dura's Ltd.",
      industry: "Technology",
      size: "1-50",
      country: "Nepal",
      timezone: "Asia/Kathmandu",
      currency: "NPR",
      fiscalYearStart: "January",
      workDaysPerWeek: 5,
      workStartTime: "09:00",
      workEndTime: "18:00",
    },
  })

  console.log(`✅ Company created: ${company.name}`)

  const departments = await Promise.all([
    prisma.department.create({ data: { companyId: company.id, name: "Executive" } }),
    prisma.department.create({ data: { companyId: company.id, name: "HR" } }),
    prisma.department.create({ data: { companyId: company.id, name: "Engineering" } }),
    prisma.department.create({ data: { companyId: company.id, name: "Finance" } }),
    prisma.department.create({ data: { companyId: company.id, name: "Sales" } }),
  ])

  console.log(`✅ ${departments.length} departments created`)

  const leaveTypes = await Promise.all([
    prisma.leaveType.create({ data: { companyId: company.id, name: "Casual Leave", totalDays: 10 } }),
    prisma.leaveType.create({ data: { companyId: company.id, name: "Sick Leave", totalDays: 7 } }),
    prisma.leaveType.create({ data: { companyId: company.id, name: "Earned Leave", totalDays: 15 } }),
    prisma.leaveType.create({ data: { companyId: company.id, name: "Maternity Leave", totalDays: 90 } }),
    prisma.leaveType.create({ data: { companyId: company.id, name: "Paternity Leave", totalDays: 14 } }),
    prisma.leaveType.create({ data: { companyId: company.id, name: "Unpaid Leave", totalDays: 0 } }),
  ])

  console.log(`✅ ${leaveTypes.length} leave types created`)

  const passwordHash = await bcrypt.hash("password123", 12)

  const user = await prisma.user.create({
    data: {
      email: "narayan@company.com",
      passwordHash,
      name: "Narayan Dura",
      role: "SUPER_ADMIN",
      companyId: company.id,
    },
  })

  console.log(`✅ User created: ${user.email} (password: password123)`)

  const employees = [
    { userId: user.id, firstName: "Narayan", lastName: "Dura", email: "narayan@company.com", phone: "+977-9841000001", departmentId: departments[0].id, position: "CEO", salary: 120000, joinDate: new Date("2024-01-15"), status: "ACTIVE", avatar: "ND" },
    { firstName: "Mr", lastName: "Manager", email: "manager@company.com", phone: "+977-9841000002", departmentId: departments[1].id, position: "HR Manager", salary: 120000, joinDate: new Date("2024-02-01"), status: "ACTIVE", avatar: "MM" },
    { firstName: "Karam", lastName: "Dura", email: "karam@company.com", phone: "+977-9841000003", departmentId: departments[2].id, position: "Software Engineer", salary: 60000, joinDate: new Date("2024-03-10"), status: "ACTIVE", avatar: "KD" },
    { firstName: "Ram", lastName: "Bdr", email: "ram@company.com", phone: "+977-9841000004", departmentId: departments[2].id, position: "Sr Fullstack Dev", salary: 20000, joinDate: new Date("2024-04-05"), status: "ON_LEAVE", avatar: "RB" },
    { firstName: "Intern", lastName: "Vai", email: "intern@company.com", phone: "+977-9841000005", departmentId: departments[2].id, position: "Software Dev", salary: 15000, joinDate: new Date("2024-05-01"), status: "ACTIVE", avatar: "IV" },
    { firstName: "Sita", lastName: "Sharma", email: "sita@company.com", phone: "+977-9841000006", departmentId: departments[3].id, position: "Accountant", salary: 45000, joinDate: new Date("2024-06-15"), status: "ACTIVE", avatar: "SS" },
    { firstName: "Bikram", lastName: "Grg", email: "bikram@company.com", phone: "+977-9841000007", departmentId: departments[4].id, position: "Sales Executive", salary: 35000, joinDate: new Date("2024-07-01"), status: "INACTIVE", avatar: "BG" },
  ]

  const createdEmployees = await Promise.all(
    employees.map((emp) =>
      prisma.employee.create({
        data: {
          ...emp,
          companyId: company.id,
          salary: new Prisma.Decimal(emp.salary.toString()),
          status: emp.status as any,
        },
      })
    )
  )

  console.log(`✅ ${createdEmployees.length} employees created`)

  console.log("🎉 Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
