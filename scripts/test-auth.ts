import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function testAuth() {
  console.log("🧪 Testing authentication...")

  const user = await prisma.user.findUnique({
    where: { email: "narayan@company.com" },
  })

  if (!user) {
    console.error("❌ User not found")
    return
  }

  console.log(`✅ User found: ${user.email}`)
  console.log(`✅ Role: ${user.role}`)
  console.log(`✅ Company ID: ${user.companyId}`)

  const isValid = await bcrypt.compare("password123", user.passwordHash)
  console.log(`${isValid ? "✅" : "❌"} Password validation: ${isValid ? "valid" : "invalid"}`)

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  })

  if (employee) {
    console.log(`✅ Employee linked: ${employee.firstName} ${employee.lastName}`)
  } else {
    console.log("❌ No employee linked to user")
  }

  console.log("\n🎉 Auth test complete!")
  console.log("\n📝 Test credentials:")
  console.log("   Email: narayan@company.com")
  console.log("   Password: password123")
}

testAuth().catch(console.error)
