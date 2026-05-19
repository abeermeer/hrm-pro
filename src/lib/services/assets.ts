import { prisma } from "@/lib/prisma"

interface AssetResult {
  success: boolean
  message: string
  asset?: any
}

export async function assignAsset(
  assetId: string,
  employeeId: string,
  companyId: string
): Promise<AssetResult> {
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, companyId },
  })

  if (!asset) {
    return { success: false, message: "Asset not found" }
  }

  if (asset.status === "ASSIGNED") {
    return { success: false, message: "Asset is already assigned" }
  }

  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
  })

  if (!employee) {
    return { success: false, message: "Employee not found" }
  }

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: {
      status: "ASSIGNED",
      employeeId,
    },
    include: { employee: true },
  })

  return { success: true, message: "Asset assigned successfully", asset: updated }
}

export async function unassignAsset(
  assetId: string,
  companyId: string
): Promise<AssetResult> {
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, companyId },
  })

  if (!asset) {
    return { success: false, message: "Asset not found" }
  }

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: {
      status: "AVAILABLE",
      employeeId: null,
    },
  })

  return { success: true, message: "Asset unassigned", asset: updated }
}

export async function getExpiringWarranties(
  companyId: string,
  daysThreshold: number = 90
): Promise<any[]> {
  const now = new Date()
  const thresholdDate = new Date()
  thresholdDate.setDate(now.getDate() + daysThreshold)

  const assets = await prisma.asset.findMany({
    where: {
      companyId,
      warrantyExpiry: {
        gte: now,
        lte: thresholdDate,
      },
      status: { not: "RETIRED" },
    },
    include: { employee: true },
    orderBy: { warrantyExpiry: "asc" },
  })

  return assets
}

export async function getAssetSummary(
  companyId: string
): Promise<{
  total: number
  assigned: number
  available: number
  maintenance: number
  retired: number
  totalValue: number
}> {
  const assets = await prisma.asset.findMany({ where: { companyId } })

  const summary = {
    total: assets.length,
    assigned: 0,
    available: 0,
    maintenance: 0,
    retired: 0,
    totalValue: 0,
  }

  for (const asset of assets) {
    summary.totalValue += Number(asset.value)

    switch (asset.status) {
      case "ASSIGNED":
        summary.assigned++
        break
      case "AVAILABLE":
        summary.available++
        break
      case "MAINTENANCE":
        summary.maintenance++
        break
      case "RETIRED":
        summary.retired++
        break
    }
  }

  return summary
}
