import { prisma } from "@/lib/prisma"

export async function createAuditLog(
  companyId: string,
  userId: string | null,
  action: string,
  module: string,
  details: string,
  before?: string,
  after?: string,
  ipAddress?: string
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      companyId,
      userId,
      action,
      module,
      details,
      before,
      after,
      ipAddress,
    },
  })
}

export async function getAuditLogs(
  companyId: string,
  options?: {
    module?: string
    action?: string
    userId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }
): Promise<any[]> {
  const where: any = { companyId }

  if (options?.module) where.module = options.module
  if (options?.action) where.action = options.action
  if (options?.userId) where.userId = options.userId
  if (options?.startDate || options?.endDate) {
    where.createdAt = {}
    if (options.startDate) where.createdAt.gte = options.startDate
    if (options.endDate) where.createdAt.lte = options.endDate
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  })

  return logs
}
