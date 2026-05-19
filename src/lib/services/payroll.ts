import { prisma } from "@/lib/prisma"

interface PayrollCalculation {
  employeeId: string
  month: string
  year: number
  basicSalary: number
  allowances: number
  overtime: number
  lop: number
  latePenalty: number
  tax: number
  providentFund: number
  deductions: number
  grossPay: number
  netPay: number
}

interface AttendanceSummary {
  present: number
  absent: number
  late: number
  onLeave: number
  halfDay: number
  notMarked: number
  totalWorkingDays: number
  totalWorkingHours: number
}

interface LeaveAccrual {
  employeeId: string
  leaveTypeId: string
  year: number
  accrued: number
}

export async function calculatePayrollForEmployee(
  employeeId: string,
  month: string,
  year: number,
  companyId: string
): Promise<PayrollCalculation | null> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
  })

  if (!employee) return null

  const startDate = new Date(year, parseInt(month) - 1, 1)
  const endDate = new Date(year, parseInt(month), 0)

  const attendance = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: { gte: startDate, lte: endDate },
    },
  })

  const summary = getAttendanceSummary(attendance, startDate, endDate)

  const workingDays = employee.joinDate < startDate
    ? getWorkingDaysInMonth(startDate, endDate)
    : getWorkingDaysInMonth(employee.joinDate, endDate)

  const lopDays = summary.absent + summary.notMarked
  const dailySalary = Number(employee.salary) / workingDays
  const lop = Math.round(dailySalary * lopDays)

  const latePenalty = summary.late * 500

  const overtimeHours = attendance.reduce((total, record) => {
    if (record.workingHours > 9) {
      return total + (record.workingHours - 9)
    }
    return total
  }, 0)

  const hourlyRate = Number(employee.salary) / (workingDays * 8)
  const overtime = Math.round(hourlyRate * 1.5 * overtimeHours)

  const basicSalary = Number(employee.salary)
  const allowances = Math.round(basicSalary * 0.3)
  const grossPay = basicSalary + allowances + overtime

  const tax = Math.round(grossPay * 0.01)
  const providentFund = Math.round(basicSalary * 0.1)

  const deductions = lop + latePenalty + tax + providentFund
  const netPay = grossPay - deductions

  return {
    employeeId,
    month,
    year,
    basicSalary,
    allowances,
    overtime,
    lop,
    latePenalty,
    tax,
    providentFund,
    deductions,
    grossPay,
    netPay,
  }
}

export async function calculatePayrollForAllEmployees(
  month: string,
  year: number,
  companyId: string
): Promise<PayrollCalculation[]> {
  const employees = await prisma.employee.findMany({
    where: { companyId, status: "ACTIVE" },
  })

  const calculations: PayrollCalculation[] = []

  for (const employee of employees) {
    const calc = await calculatePayrollForEmployee(employee.id, month, year, companyId)
    if (calc) calculations.push(calc)
  }

  return calculations
}

export async function generatePayrollForMonth(
  month: string,
  year: number,
  companyId: string
): Promise<{ created: number; updated: number }> {
  const calculations = await calculatePayrollForAllEmployees(month, year, companyId)

  let created = 0
  let updated = 0

  for (const calc of calculations) {
    const existing = await prisma.payrollRecord.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: calc.employeeId,
          month: calc.month,
          year: calc.year,
        },
      },
    })

    if (existing) {
      await prisma.payrollRecord.update({
        where: { id: existing.id },
        data: {
          basicSalary: calc.basicSalary,
          allowances: calc.allowances,
          overtime: calc.overtime,
          lop: calc.lop,
          latePenalty: calc.latePenalty,
          tax: calc.tax,
          providentFund: calc.providentFund,
          deductions: calc.deductions,
          grossPay: calc.grossPay,
          netPay: calc.netPay,
        },
      })
      updated++
    } else {
      await prisma.payrollRecord.create({
        data: {
          companyId,
          employeeId: calc.employeeId,
          month: calc.month,
          year: calc.year,
          basicSalary: calc.basicSalary,
          allowances: calc.allowances,
          overtime: calc.overtime,
          lop: calc.lop,
          latePenalty: calc.latePenalty,
          tax: calc.tax,
          providentFund: calc.providentFund,
          deductions: calc.deductions,
          grossPay: calc.grossPay,
          netPay: calc.netPay,
          status: "DRAFT",
        },
      })
      created++
    }
  }

  return { created, updated }
}

export function getAttendanceSummary(
  attendance: any[],
  startDate: Date,
  endDate: Date
): AttendanceSummary {
  const summary: AttendanceSummary = {
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
    halfDay: 0,
    notMarked: 0,
    totalWorkingDays: 0,
    totalWorkingHours: 0,
  }

  const workingDays = getWorkingDaysInMonth(startDate, endDate)
  summary.totalWorkingDays = workingDays

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
        summary.present++
        break
      case "ON_LEAVE":
        summary.onLeave++
        break
      case "HALF_DAY":
        summary.halfDay++
        summary.present += 0.5
        break
      case "NOT_MARKED":
        summary.notMarked++
        break
    }
    summary.totalWorkingHours += record.workingHours || 0
  }

  return summary
}

export function getWorkingDaysInMonth(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)

  while (current <= endDate) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

export async function accrueLeaveBalances(companyId: string, year: number): Promise<number> {
  const leaveTypes = await prisma.leaveType.findMany({
    where: { companyId },
  })

  const employees = await prisma.employee.findMany({
    where: { companyId, status: "ACTIVE" },
  })

  let accrued = 0

  for (const employee of employees) {
    for (const leaveType of leaveTypes) {
      if (leaveType.totalDays <= 0) continue

      const monthlyAccrual = leaveType.totalDays / 12

      const balance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year,
        },
      })

      if (balance) {
        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            total: { increment: monthlyAccrual },
            remaining: { increment: monthlyAccrual },
          },
        })
      } else {
        await prisma.leaveBalance.create({
          data: {
            companyId,
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year,
            total: Math.round(monthlyAccrual),
            used: 0,
            remaining: Math.round(monthlyAccrual),
          },
        })
      }

      accrued++
    }
  }

  return accrued
}

export async function syncAttendanceToPayroll(
  employeeId: string,
  date: Date,
  companyId: string
): Promise<void> {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  const payrollRecord = await prisma.payrollRecord.findUnique({
    where: {
      employeeId_month_year: { employeeId, month, year },
    },
  })

  if (payrollRecord) {
    const calc = await calculatePayrollForEmployee(employeeId, month, year, companyId)
    if (calc) {
      await prisma.payrollRecord.update({
        where: { id: payrollRecord.id },
        data: {
          lop: calc.lop,
          latePenalty: calc.latePenalty,
          overtime: calc.overtime,
          deductions: calc.deductions,
          grossPay: calc.grossPay,
          netPay: calc.netPay,
        },
      })
    }
  }
}

export async function markCheckIn(
  employeeId: string,
  date: Date,
  companyId: string
): Promise<any> {
  const now = new Date()
  const workStart = new Date(date)
  workStart.setHours(9, 0, 0, 0)

  const isLate = now > workStart

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

  await syncAttendanceToPayroll(employeeId, date, companyId)

  return attendance
}

export async function markCheckOut(
  employeeId: string,
  date: Date,
  companyId: string
): Promise<any> {
  const now = new Date()

  const attendance = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date } },
  })

  if (!attendance || !attendance.checkIn) {
    throw new Error("No check-in record found for today")
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

  await syncAttendanceToPayroll(employeeId, date, companyId)

  return updated
}
