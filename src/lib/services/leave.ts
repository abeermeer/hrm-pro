import { prisma } from "@/lib/prisma"

interface LeaveRequestResult {
  success: boolean
  message: string
  leaveRequest?: any
}

export async function requestLeave(
  employeeId: string,
  leaveTypeId: string,
  startDate: Date,
  endDate: Date,
  reason: string,
  companyId: string
): Promise<LeaveRequestResult> {
  const leaveType = await prisma.leaveType.findFirst({
    where: { id: leaveTypeId, companyId },
  })

  if (!leaveType) {
    return { success: false, message: "Invalid leave type" }
  }

  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
  })

  if (!employee) {
    return { success: false, message: "Employee not found" }
  }

  if (leaveType.probationBlock) {
    const probationEnd = new Date(employee.joinDate)
    probationEnd.setMonth(probationEnd.getMonth() + 3)
    if (startDate < probationEnd) {
      return { success: false, message: "Cannot take leave during probation period" }
    }
  }

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const year = startDate.getFullYear()

  const balance = await prisma.leaveBalance.findFirst({
    where: {
      employeeId,
      leaveTypeId,
      year,
    },
  })

  if (!balance) {
    return { success: false, message: "No leave balance found for this year" }
  }

  if (balance.remaining < days) {
    return { success: false, message: `Insufficient leave balance. Available: ${balance.remaining} days` }
  }

  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      companyId,
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      days,
      reason,
      status: "PENDING",
    },
    include: { employee: true, leaveType: true },
  })

  return { success: true, message: "Leave request submitted successfully", leaveRequest }
}

export async function approveLeave(
  leaveRequestId: string,
  companyId: string,
  reviewedBy: string
): Promise<LeaveRequestResult> {
  const leaveRequest = await prisma.leaveRequest.findFirst({
    where: { id: leaveRequestId, companyId },
    include: { employee: true, leaveType: true },
  })

  if (!leaveRequest) {
    return { success: false, message: "Leave request not found" }
  }

  if (leaveRequest.status !== "PENDING") {
    return { success: false, message: "Leave request is not pending" }
  }

  const year = leaveRequest.startDate.getFullYear()

  const balance = await prisma.leaveBalance.findFirst({
    where: {
      employeeId: leaveRequest.employeeId,
      leaveTypeId: leaveRequest.leaveTypeId,
      year,
    },
  })

  if (!balance || balance.remaining < leaveRequest.days) {
    return { success: false, message: "Insufficient leave balance" }
  }

  const updated = await prisma.$transaction([
    prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: "APPROVED",
        reviewedBy,
        reviewedAt: new Date(),
      },
      include: { employee: true, leaveType: true },
    }),
    prisma.leaveBalance.update({
      where: { id: balance.id },
      data: {
        used: { increment: leaveRequest.days },
        remaining: { decrement: leaveRequest.days },
      },
    }),
  ])

  return { success: true, message: "Leave approved successfully", leaveRequest: updated[0] }
}

export async function rejectLeave(
  leaveRequestId: string,
  companyId: string,
  reviewedBy: string,
  rejectionReason: string
): Promise<LeaveRequestResult> {
  const leaveRequest = await prisma.leaveRequest.findFirst({
    where: { id: leaveRequestId, companyId },
  })

  if (!leaveRequest) {
    return { success: false, message: "Leave request not found" }
  }

  if (leaveRequest.status !== "PENDING") {
    return { success: false, message: "Leave request is not pending" }
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: leaveRequestId },
    data: {
      status: "REJECTED",
      reviewedBy,
      reviewedAt: new Date(),
      rejectionReason,
    },
    include: { employee: true, leaveType: true },
  })

  return { success: true, message: "Leave rejected", leaveRequest: updated }
}

export async function cancelLeave(
  leaveRequestId: string,
  companyId: string
): Promise<LeaveRequestResult> {
  const leaveRequest = await prisma.leaveRequest.findFirst({
    where: { id: leaveRequestId, companyId },
  })

  if (!leaveRequest) {
    return { success: false, message: "Leave request not found" }
  }

  if (leaveRequest.status === "APPROVED") {
    const year = leaveRequest.startDate.getFullYear()

    const balance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId: leaveRequest.employeeId,
        leaveTypeId: leaveRequest.leaveTypeId,
        year,
      },
    })

    if (balance) {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: { decrement: leaveRequest.days },
          remaining: { increment: leaveRequest.days },
        },
      })
    }
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: leaveRequestId },
    data: { status: "CANCELLED" },
    include: { employee: true, leaveType: true },
  })

  return { success: true, message: "Leave cancelled", leaveRequest: updated }
}

export async function getLeaveBalance(
  employeeId: string,
  companyId: string,
  year?: number
): Promise<any[]> {
  const targetYear = year || new Date().getFullYear()

  const balances = await prisma.leaveBalance.findMany({
    where: {
      employeeId,
      companyId,
      year: targetYear,
    },
    include: { leaveType: true },
  })

  return balances
}

export async function initializeLeaveBalances(
  companyId: string,
  year: number
): Promise<number> {
  const leaveTypes = await prisma.leaveType.findMany({
    where: { companyId },
  })

  const employees = await prisma.employee.findMany({
    where: { companyId, status: "ACTIVE" },
  })

  let created = 0

  for (const employee of employees) {
    for (const leaveType of leaveTypes) {
      const existing = await prisma.leaveBalance.findFirst({
        where: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year,
        },
      })

      if (!existing && leaveType.totalDays > 0) {
        await prisma.leaveBalance.create({
          data: {
            companyId,
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year,
            total: leaveType.totalDays,
            used: 0,
            remaining: leaveType.totalDays,
          },
        })
        created++
      }
    }
  }

  return created
}
