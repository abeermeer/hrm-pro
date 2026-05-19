import { prisma } from "@/lib/prisma"

interface AttendanceResult {
  success: boolean
  message: string
  attendance?: any
}

export async function markCheckIn(
  employeeId: string,
  date: Date,
  companyId: string,
  checkInTime?: Date
): Promise<AttendanceResult> {
  const now = checkInTime || new Date()

  const workStart = new Date(date)
  workStart.setHours(9, 0, 0, 0)

  const isLate = now > workStart

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date } },
  })

  if (existing && existing.checkIn) {
    return { success: false, message: "Already checked in for today" }
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      employeeId_date: { employeeId, date },
    },
    create: {
      companyId,
      employeeId,
      date,
      checkIn: now,
      status: isLate ? "LATE" : "PRESENT",
      workingHours: 0,
    },
    update: {
      checkIn: now,
      status: isLate ? "LATE" : "PRESENT",
    },
  })

  return { success: true, message: isLate ? "Checked in (Late)" : "Checked in", attendance }
}

export async function markCheckOut(
  employeeId: string,
  date: Date,
  companyId: string,
  checkOutTime?: Date
): Promise<AttendanceResult> {
  const now = checkOutTime || new Date()

  const attendance = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date } },
  })

  if (!attendance) {
    return { success: false, message: "No attendance record found. Check in first." }
  }

  if (!attendance.checkIn) {
    return { success: false, message: "No check-in record found for today" }
  }

  if (attendance.checkOut) {
    return { success: false, message: "Already checked out for today" }
  }

  const checkIn = new Date(attendance.checkIn)
  const checkOut = now
  const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)

  const updated = await prisma.attendance.update({
    where: { employeeId_date: { employeeId, date } },
    data: {
      checkOut,
      workingHours: Math.round(hoursWorked * 10) / 10,
    },
  })

  return { success: true, message: "Checked out", attendance: updated }
}

export async function requestCorrection(
  employeeId: string,
  date: Date,
  type: "check-in" | "check-out" | "full-day",
  reason: string,
  companyId: string
): Promise<AttendanceResult> {
  const correction = await prisma.attendance.upsert({
    where: {
      employeeId_date: { employeeId, date },
    },
    create: {
      companyId,
      employeeId,
      date,
      status: "NOT_MARKED",
      notes: `[CORRECTION REQUEST - ${type}] ${reason}`,
      workingHours: 0,
    },
    update: {
      notes: `[CORRECTION REQUEST - ${type}] ${reason}`,
    },
  })

  return { success: true, message: "Correction request submitted", attendance: correction }
}

export async function approveCorrection(
  employeeId: string,
  date: Date,
  companyId: string,
  checkIn?: Date,
  checkOut?: Date
): Promise<AttendanceResult> {
  const attendance = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date } },
  })

  if (!attendance) {
    return { success: false, message: "Attendance record not found" }
  }

  const updates: any = {}

  if (checkIn) {
    updates.checkIn = checkIn
  }

  if (checkOut) {
    updates.checkOut = checkOut
  }

  if (checkIn && checkOut) {
    const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
    updates.workingHours = Math.round(hoursWorked * 10) / 10
    updates.status = hoursWorked >= 4 ? "PRESENT" : "HALF_DAY"
  }

  updates.notes = attendance.notes?.replace(/\[CORRECTION REQUEST.*?\]/, "[CORRECTED]") || "[CORRECTED]"

  const updated = await prisma.attendance.update({
    where: { employeeId_date: { employeeId, date } },
    data: updates,
  })

  return { success: true, message: "Correction applied", attendance: updated }
}

export async function getAttendanceSummary(
  companyId: string,
  date: Date
): Promise<{
  present: number
  absent: number
  late: number
  onLeave: number
  halfDay: number
  notMarked: number
}> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const attendance = await prisma.attendance.findMany({
    where: {
      companyId,
      date: { gte: startOfDay, lte: endOfDay },
    },
  })

  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
    halfDay: 0,
    notMarked: 0,
  }

  const employees = await prisma.employee.count({
    where: { companyId, status: "ACTIVE" },
  })

  for (const record of attendance) {
    switch (record.status) {
      case "PRESENT":
        summary.present++
        break
      case "ABSENT":
        summary.absent++
        break
      case "LATE":
        summary.late++
        break
      case "ON_LEAVE":
        summary.onLeave++
        break
      case "HALF_DAY":
        summary.halfDay++
        break
      case "NOT_MARKED":
        summary.notMarked++
        break
    }
  }

  const marked = attendance.filter((a) => a.status !== "NOT_MARKED").length
  summary.notMarked = employees - marked

  return summary
}

export async function getMonthlyAttendance(
  companyId: string,
  month: number,
  year: number
): Promise<any[]> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  const attendance = await prisma.attendance.findMany({
    where: {
      companyId,
      date: { gte: startDate, lte: endDate },
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
          department: true,
        },
      },
    },
    orderBy: [{ date: "desc" }, { employee: { firstName: "asc" } }],
  })

  return attendance
}

export async function markAbsent(
  employeeId: string,
  date: Date,
  companyId: string
): Promise<AttendanceResult> {
  const attendance = await prisma.attendance.upsert({
    where: {
      employeeId_date: { employeeId, date },
    },
    create: {
      companyId,
      employeeId,
      date,
      status: "ABSENT",
      workingHours: 0,
    },
    update: {
      status: "ABSENT",
      workingHours: 0,
    },
  })

  return { success: true, message: "Marked as absent", attendance }
}
