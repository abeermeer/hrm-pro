import { prisma } from "@/lib/prisma"

interface ExpenseResult {
  success: boolean
  message: string
  expense?: any
}

export async function submitExpense(
  employeeId: string,
  category: string,
  amount: number,
  date: Date,
  description: string,
  companyId: string,
  receipt?: boolean
): Promise<ExpenseResult> {
  const expense = await prisma.expenseClaim.create({
    data: {
      companyId,
      employeeId,
      category,
      amount,
      date,
      description,
      receipt: receipt || false,
      status: "PENDING",
    },
    include: { employee: true },
  })

  return { success: true, message: "Expense submitted successfully", expense }
}

export async function approveExpense(
  expenseId: string,
  companyId: string,
  reviewedBy: string
): Promise<ExpenseResult> {
  const expense = await prisma.expenseClaim.findFirst({
    where: { id: expenseId, companyId },
    include: { employee: true },
  })

  if (!expense) {
    return { success: false, message: "Expense not found" }
  }

  if (expense.status !== "PENDING") {
    return { success: false, message: "Expense is not pending" }
  }

  const updated = await prisma.expenseClaim.update({
    where: { id: expenseId },
    data: {
      status: "APPROVED",
      reviewedBy,
      reviewedAt: new Date(),
    },
    include: { employee: true },
  })

  return { success: true, message: "Expense approved", expense: updated }
}

export async function rejectExpense(
  expenseId: string,
  companyId: string,
  reviewedBy: string
): Promise<ExpenseResult> {
  const expense = await prisma.expenseClaim.findFirst({
    where: { id: expenseId, companyId },
    include: { employee: true },
  })

  if (!expense) {
    return { success: false, message: "Expense not found" }
  }

  if (expense.status !== "PENDING") {
    return { success: false, message: "Expense is not pending" }
  }

  const updated = await prisma.expenseClaim.update({
    where: { id: expenseId },
    data: {
      status: "REJECTED",
      reviewedBy,
      reviewedAt: new Date(),
    },
    include: { employee: true },
  })

  return { success: true, message: "Expense rejected", expense: updated }
}

export async function getExpenseSummary(
  companyId: string,
  month?: number,
  year?: number
): Promise<{
  total: number
  pending: number
  approved: number
  rejected: number
  byCategory: { category: string; total: number; count: number }[]
}> {
  const where: any = { companyId }

  if (month && year) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    where.date = { gte: startDate, lte: endDate }
  }

  const expenses = await prisma.expenseClaim.findMany({ where })

  const summary = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byCategory: [] as { category: string; total: number; count: number }[],
  }

  const categoryMap = new Map<string, { total: number; count: number }>()

  for (const expense of expenses) {
    const amount = Number(expense.amount)
    summary.total += amount

    switch (expense.status) {
      case "PENDING":
        summary.pending += amount
        break
      case "APPROVED":
        summary.approved += amount
        break
      case "REJECTED":
        summary.rejected += amount
        break
    }

    const cat = categoryMap.get(expense.category) || { total: 0, count: 0 }
    cat.total += amount
    cat.count++
    categoryMap.set(expense.category, cat)
  }

  summary.byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
  }))

  return summary
}
